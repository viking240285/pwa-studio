import { useCallback, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery } from '@apollo/client';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';

import { appendOptionsToPayload } from '@magento/peregrine/lib/util/appendOptionsToPayload';
import { findMatchingVariant } from '@magento/peregrine/lib/util/findMatchingProductVariant';
import { isProductConfigurable } from '@magento/peregrine/lib/util/isProductConfigurable';
import { isSupportedProductType as isSupported } from '@magento/peregrine/lib/util/isSupportedProductType';
import { deriveErrorMessage } from '../../util/deriveErrorMessage';
import mergeOperations from '../../util/shallowMerge';
import defaultOperations from './productFullDetail.gql';

const INITIAL_OPTION_CODES = new Map();
const INITIAL_OPTION_SELECTIONS = new Map();
const OUT_OF_STOCK_CODE = 'OUT_OF_STOCK';

const deriveOptionCodesFromProduct = product => {
    // If this is a simple product it has no option codes.
    if (!isProductConfigurable(product)) {
        return INITIAL_OPTION_CODES;
    }

    // Initialize optionCodes based on the options of the product.
    const initialOptionCodes = new Map();
    for (const {
        attribute_id,
        attribute_code
    } of product.configurable_options) {
        initialOptionCodes.set(attribute_id, attribute_code);
    }

    return initialOptionCodes;
};

// Similar to deriving the initial codes for each option.
const deriveOptionSelectionsFromProduct = product => {
    if (!isProductConfigurable(product)) {
        return INITIAL_OPTION_SELECTIONS;
    }

    const initialOptionSelections = new Map();
    for (const { attribute_id } of product.configurable_options) {
        initialOptionSelections.set(attribute_id, undefined);
    }

    return initialOptionSelections;
};

const getIsMissingOptions = (product, optionSelections) => {
    // Non-configurable products can't be missing options.
    if (!isProductConfigurable(product)) {
        return false;
    }

    // Configurable products are missing options if we have fewer
    // option selections than the product has options.
    const { configurable_options } = product;
    const numProductOptions = configurable_options.length;
    const numProductSelections = Array.from(optionSelections.values()).filter(
        value => !!value
    ).length;

    return numProductSelections < numProductOptions;
};

const getIsOutOfStock = (product, optionCodes, optionSelections) => {
    const { stock_status, variants } = product;
    const isConfigurable = isProductConfigurable(product);
    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;

    if (isConfigurable && optionsSelected) {
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });

        return item.product.stock_status === OUT_OF_STOCK_CODE;
    }
    return stock_status === OUT_OF_STOCK_CODE;
};

const getMediaGalleryEntries = (product, optionCodes, optionSelections) => {
    let value = [];

    const { media_gallery_entries, variants } = product;
    const isConfigurable = isProductConfigurable(product);

    // Selections are initialized to "code => undefined". Once we select a value, like color, the selections change. This filters out unselected options.
    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;

    if (!isConfigurable || !optionsSelected) {
        value = media_gallery_entries;
    } else {
        // If any of the possible variants matches the selection add that
        // variant's image to the media gallery. NOTE: This _can_, and does,
        // include variants such as size. If Magento is configured to display
        // an image for a size attribute, it will render that image.
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });

        value = item
            ? [...item.product.media_gallery_entries, ...media_gallery_entries]
            : media_gallery_entries;
    }

    return value;
};

// We only want to display breadcrumbs for one category on a PDP even if a
// product has multiple related categories. This function filters and selects
// one category id for that purpose.
const getBreadcrumbCategoryId = categories => {
    // Exit if there are no categories for this product.
    if (!categories || !categories.length) {
        return;
    }
    const breadcrumbSet = new Set();
    categories.forEach(({ breadcrumbs }) => {
        // breadcrumbs can be `null`...
        (breadcrumbs || []).forEach(({ category_id }) =>
            breadcrumbSet.add(category_id)
        );
    });

    // Until we can get the single canonical breadcrumb path to a product we
    // will just return the first category id of the potential leaf categories.
    const leafCategory = categories.find(
        category => !breadcrumbSet.has(category.id)
    );

    // If we couldn't find a leaf category then just use the first category
    // in the list for this product.
    return leafCategory.id || categories[0].id;
};

const getConfigPrice = (product, optionCodes, optionSelections) => {
    let value;

    const { variants } = product;
    const isConfigurable = isProductConfigurable(product);

    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;

    if (!isConfigurable || !optionsSelected) {
        value = product.price.regularPrice.amount;
    } else {
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });

        value = item
            ? item.product.price.regularPrice.amount
            : product.price.regularPrice.amount;
    }

    return value;
};

/**
 * @param {GraphQLDocument} props.addConfigurableProductToCartMutation - configurable product mutation
 * @param {GraphQLDocument} props.addSimpleProductToCartMutation - configurable product mutation
 * @param {Object.<string, GraphQLDocument>} props.operations - collection of operation overrides merged into defaults
 * @param {Object} props.product - the product, see RootComponents/Product
 *
 * @returns {{
 *  breadcrumbCategoryId: string|undefined,
 *  errorMessage: string|undefined,
 *  handleAddToCart: func,
 *  handleSelectionChange: func,
 *  handleSetQuantity: func,
 *  isAddToCartDisabled: boolean,
 *  isSupportedProductType: boolean,
 *  mediaGalleryEntries: array,
 *  productDetails: object,
 *  quantity: number
 * }}
 */
export const useProductFullDetail = props => {
    const {
        addConfigurableProductToCartMutation,
        addSimpleProductToCartMutation,
        product
    } = props;

    const hasDeprecatedOperationProp = !!(
        addConfigurableProductToCartMutation || addSimpleProductToCartMutation
    );

    const operations = mergeOperations(defaultOperations, props.operations);

    const productType = product.__typename;

    const isSupportedProductType = isSupported(productType);

    const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();
    const { formatMessage } = useIntl();

    const { data: storeConfigData } = useQuery(
        operations.getWishlistConfigQuery,
        {
            fetchPolicy: 'cache-and-network'
        }
    );

    const [
        addConfigurableProductToCart,
        {
            error: errorAddingConfigurableProduct,
            loading: isAddConfigurableLoading
        }
    ] = useMutation(
        addConfigurableProductToCartMutation ||
        operations.addConfigurableProductToCartMutation
    );

    const [
        addSimpleProductToCart,
        { error: errorAddingSimpleProduct, loading: isAddSimpleLoading }
    ] = useMutation(
        addSimpleProductToCartMutation ||
        operations.addSimpleProductToCartMutation
    );

    const [
        addProductToCart,
        { error: errorAddingProductToCart, loading: isAddProductLoading }
    ] = useMutation(operations.addProductToCartMutation);

    const [
        addProductsToCart,
        { error: errorAddingProductsToCart, loading: isAddProductsLoading }
    ] = useMutation(operations.addProductsToCartMutation);

    const breadcrumbCategoryId = useMemo(
        () => getBreadcrumbCategoryId(product.categories),
        [product.categories]
    );

    const derivedOptionSelections = useMemo(
        () => deriveOptionSelectionsFromProduct(product),
        [product]
    );

    const [optionSelections, setOptionSelections] = useState(
        derivedOptionSelections
    );

    const derivedOptionCodes = useMemo(
        () => deriveOptionCodesFromProduct(product),
        [product]
    );
    const [optionCodes] = useState(derivedOptionCodes);

    const isMissingOptions = useMemo(
        () => getIsMissingOptions(product, optionSelections),
        [product, optionSelections]
    );

    const isOutOfStock = useMemo(
        () => getIsOutOfStock(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );

    const mediaGalleryEntries = useMemo(
        () => getMediaGalleryEntries(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );

    // The map of ids to values (and their uids)
    // For example:
    // { "179" => [{ uid: "abc", value_index: 1 }, { uid: "def", value_index: 2 }]}
    const attributeIdToValuesMap = useMemo(() => {
        const map = new Map();
        // For simple items, this will be an empty map.
        const options = product.configurable_options || [];
        for (const { attribute_id, values } of options) {
            map.set(attribute_id, values);
        }
        return map;
    }, [product.configurable_options]);

    // An array of selected option uids. Useful for passing to mutations.
    // For example:
    // ["abc", "def"]
    const selectedOptionsArray = useMemo(() => {
        const selectedOptions = [];

        optionSelections.forEach((value, key) => {
            const values = attributeIdToValuesMap.get(key);

            const selectedValue = values.find(
                item => item.value_index === value
            );

            if (selectedValue) {
                selectedOptions.push(selectedValue.uid);
            }
        });
        return selectedOptions;
    }, [attributeIdToValuesMap, optionSelections]);

    const handleAddToCart = useCallback(
        async formValues => {
            const { quantity } = formValues;

            /*
                @deprecated in favor of general addProductsToCart mutation. Will support until the next MAJOR.
             */
            if (hasDeprecatedOperationProp) {
console.log('hasDeprecatedOperationProp ><><><><><><>', hasDeprecatedOperationProp);
                const payload = {
                    item: product,
                    productType,
                    quantity
                };

                if (isProductConfigurable(product)) {
                    appendOptionsToPayload(
                        payload,
                        optionSelections,
                        optionCodes
                    );
                }

                if (isSupportedProductType) {
                    const variables = {
                        cartId,
                        parentSku: payload.parentSku,
                        product: payload.item,
                        quantity: payload.quantity,
                        sku: payload.item.sku
                    };
                    // Use the proper mutation for the type.
                    if (productType === 'SimpleProduct') {
                        try {
                            await addSimpleProductToCart({
                                variables
                            });
                        } catch {
                            return;
                        }
                    } else if (productType === 'ConfigurableProduct') {
                        try {
                            await addConfigurableProductToCart({
                                variables
                            });
                        } catch {
                            return;
                        }
                    }
                } else {
                    console.error(
                        'Unsupported product type. Cannot add to cart.'
                    );
                }
            } else {
                console.log('Cart here');
                const variables0 = {
                    cartId,
                    product: {
                        sku: product.sku,
                        quantity
                    },
                    entered_options: [
                        {
                            uid: product.uid,
                            value: product.name
                        }
                    ]
                };

                /*const variables1111 = {
                    cartId,
                    cartItems: [
                        {
                            quantity: 1,
                            sku: "VA20-SI-NA",
                            // entered_options: [{
                            //     uid: "MTA=",
                            //     value: "Semper Bangle Set"
                            // }]
                        },
                        {
                            quantity: 1,
                            sku: "VA23",
                            // entered_options: [{
                            //     uid: "MTE2Nw==",
                            //     value: "Augusta Trio"
                            // }]
                        },
                        {
                            quantity: 2,
                            sku: "VA22-SI-NA",
                            // entered_options: [{
                            //     uid: "MTI=",
                            //     value: "Silver Amor Bangle Set"
                            // }]
                        },

                    ]
                };*/
                console.log(cartId);
                const variables = {
                    cartId,
                    cartItems: [
                        {
                            quantity: quantity,
                            sku: product.sku,
                            // entered_options: [{
                            //     uid: "MTA=",
                            //     value: "Semper Bangle Set"
                            // }]
                        }
                    ]
                };
                /*const variables = {
                    cartId,
                    cartItems: [
                        {
                            quantity: 1,
                            sku: "125038",
                            entered_options: [{
                                uid: "MTI1MDM4",
                                value: "Perceuse à percussion sans fil Bosch GSB 18V-110 C; 18 V; 2x5,0 Ah accu."
                            }]
                        },
                        {
                            quantity: 1,
                            sku: "110080",
                            entered_options: [{
                                uid: "MTEwMDgw",
                                value: "Cache-oreilles pour diminuer le bruit Honeywell VeriShield VS110; 27 dB; 1 unités"
                            }]
                        },
                        {
                            quantity: 2,
                            sku: "171838",
                            entered_options: [{
                                uid: "MTcxODM4",
                                value: "Lunettes de protection Honeywell SVP200 Anti-Fog, transparent"
                            }]
                        },

                    ]
                };*/

                console.log('variables', variables);

                if (selectedOptionsArray.length) {
                    variables.product.selected_options = selectedOptionsArray;
                }
                try {
                    await addProductsToCart({ variables });
                    // await addProductToCart({ variables });
                } catch {
                    return;
                }
            }
        },
        [
            addConfigurableProductToCart,
            // addProductToCart,
            addProductsToCart,
            addSimpleProductToCart,
            cartId,
            hasDeprecatedOperationProp,
            isSupportedProductType,
            optionCodes,
            optionSelections,
            product,
            productType,
            selectedOptionsArray
        ]
    );

    const handleSelectionChange = useCallback(
        (optionId, selection) => {
            // We must create a new Map here so that React knows that the value
            // of optionSelections has changed.
            const nextOptionSelections = new Map([...optionSelections]);
            nextOptionSelections.set(optionId, selection);
            setOptionSelections(nextOptionSelections);
        },
        [optionSelections]
    );

    const productPrice = useMemo(
        () => getConfigPrice(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );

    // Normalization object for product details we need for rendering.
    const productDetails = {
        description: product.description,
        name: product.name,
        price: productPrice,
        sku: product.sku,
    };

    // Normalization object for product options (additional products list) details we need for rendering.
    const productLinkedItems = {
        linked_products: product.related_products
    }

    const derivedErrorMessage = useMemo(
        () =>
            deriveErrorMessage([
                errorAddingSimpleProduct,
                errorAddingConfigurableProduct,
                errorAddingProductToCart,
                errorAddingProductsToCart
            ]),
        [
            errorAddingConfigurableProduct,
            errorAddingProductToCart,
            errorAddingProductsToCart,
            errorAddingSimpleProduct
        ]
    );

    const wishlistItemOptions = useMemo(() => {
        const options = {
            quantity: 1,
            sku: product.sku
        };

        if (productType === 'ConfigurableProduct') {
            options.selected_options = selectedOptionsArray;
        }

        return options;
    }, [product, productType, selectedOptionsArray]);

    const wishlistButtonProps = {
        buttonText: isSelected =>
            isSelected
                ? formatMessage({
                    id: 'wishlistButton.addedText',
                    defaultMessage: 'Added to Favorites'
                })
                : formatMessage({
                    id: 'wishlistButton.addText',
                    defaultMessage: 'Add to Favorites'
                }),
        item: wishlistItemOptions,
        storeConfig: storeConfigData ? storeConfigData.storeConfig : {}
    };

    return {
        breadcrumbCategoryId,
        errorMessage: derivedErrorMessage,
        handleAddToCart,
        handleSelectionChange,
        isOutOfStock,
        isAddToCartDisabled:
            isOutOfStock ||
            isMissingOptions ||
            isAddConfigurableLoading ||
            isAddSimpleLoading ||
            isAddProductLoading,
        isAddProductsLoading,
        isSupportedProductType,
        mediaGalleryEntries,
        shouldShowWishlistButton:
            isSignedIn &&
            storeConfigData &&
            !!storeConfigData.storeConfig.magento_wishlist_general_is_enabled,
        productDetails,
        productLinkedItems,
        wishlistButtonProps,
        wishlistItemOptions
    };
};
