import React, { useMemo, Fragment } from "react";
import { gql, useQuery } from '@apollo/client';
import { FormattedMessage } from 'react-intl';
import { GET_LINKED_PRODUCTS } from "./linkedProducts.gql";
import { fullPageLoadingIndicator } from "@magento/venia-ui/lib/components/LoadingIndicator";
import { Link } from 'react-router-dom';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
import ErrorView from "@magento/venia-ui/lib/components/ErrorView";
import Image from "@magento/venia-ui/lib/components/Image";
import Price from '@magento/venia-ui/lib/components/Price';
import {UNCONSTRAINED_SIZE_KEY} from "@magento/peregrine/lib/talons/Image/useImage";
import {array, number, oneOfType, shape, string} from "prop-types";
import {useStyle} from "../../classify";
import defaultClasses from "./linkedProducts.module.css";
import Quantity, { QuantityFields } from '../CartPage/ProductListing/quantity';
import ProductOptions from "../LegacyMiniCart/productOptions";
// import GalleryItemShimmer from "../RelatedProducts/item.shimmer";
// import GalleryItem from "../RelatedProducts/item";
// import {QuantityFields} from "../CartPage/ProductListing/quantity";
// import defaultClasses from "../RelatedProducts/gallery.module.css

// import { UNCONSTRAINED_SIZE_KEY } from "@magento/peregrine/lib/talons/Image/useImage";

import Product, {REMOVE_ITEM_MUTATION, UPDATE_QUANTITY_MUTATION} from "../CartPage/ProductListing/product";
import {useProduct} from "@magento/peregrine/lib/talons/CartPage/ProductListing/useProduct";
import Checkbox from "../Checkbox";


const LinkedProducts = props => {
    // const { productMy } = props;
    const {
        classesName,
        productDetails,
        mediaGalleryEntries,
        options,
        quantity
    } = props;

/*    const talonProps = useProduct({
        operations: {
            removeItemMutation: REMOVE_ITEM_MUTATION,
            updateItemQuantityMutation: UPDATE_QUANTITY_MUTATION
        },
        ...props
    });

    const {
        addToWishlistProps,
        errorMessage,
        handleEditItem,
        handleRemoveFromCart,
        handleUpdateItemQuantity,
        isEditable,
        product,
        isProductUpdating
    } = talonProps;*/

    // const classes = useStyle(defaultClasses, classesName);
    const classes = useStyle(defaultClasses);
    // console.log('mediaGalleryEntries >>', mediaGalleryEntries);
    // console.log('options >>', options);
    console.log('classesName >>', classesName);
    console.log('classes >>', classes);
    // console.log('>>>>>>>>>>>>>>>>', props);
    // console.log('sku >> >> >> >>', productDetails.sku);
    // const classes = className;
    const productSku = productDetails.sku;

    // console.log('productSku>>>>>', productDetails.sku);

    const {data : linkedProductsData, loading, error} = useQuery(GET_LINKED_PRODUCTS, {
        variables: {sku: productSku},
        // variables: { search: "Cardigan" },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
        // skip: !uid,
        // skip: !sku,
        // errorPolicy: 'all'
    });

    // const { data: linkedProductsData2 } = useQuery(GET_LINKED_PRODUCTS, {
    //     fetchPolicy: 'cache-and-network',
    //     variables: {sku: productSku},
    // });
    // const [
    //     linkedProductsData2,
    //     { loading: isAddLoading, error: addProductError }
    // ] = useMutation(operations.addProductToWishlistMutation, {
    //     refetchQueries: [{ query: operations.getWishlistsQuery }]
    // });


    const IMAGE_WIDTH = 50;
    const IMAGE_HEIGHT = 50;

    const IMAGE_WIDTHS = new Map()
        .set(50, IMAGE_WIDTH)
        .set(UNCONSTRAINED_SIZE_KEY, 50);

/*    const linkedProducts = useMemo(() => {
        return linkedProductsData
            ? linkedProductsData
            : null;
    }, [linkedProductsData]);

    if (!linkedProducts) {
        if (loading) {
            return fullPageLoadingIndicator;
        }

        if (error) {
            return <ErrorView message={error.message} />;
        }
    }
    const product = linkedProducts.products.items.length > 0 ? linkedProducts.products.items[0] : null;
    const relatedProductsData = product ? product.related_products : null;
    const relatedProducts = relatedProductsData.length > 0 ? relatedProductsData : null;
*/
    const noitems = [
        {
            "id": 110080,
            "uid": "MTEwMDgw",
            "sku": "110080",
            "url_key": "cache-oreilles-pour-diminuer-le-bruit-honeywell-verishield-vs110-27-db-1-unites",
            "name": "Cache-oreilles pour diminuer le bruit Honeywell VeriShield VS110; 27 dB; 1 unités",
            "url_suffix": ".html",
            "small_image": {
                "url": "https://verkter.mobsdev.com/media/catalog/product/placeholder/default/verkter_logo_blank_JPG_5.jpg",
                "label": "Cache-oreilles pour diminuer le bruit Honeywell VeriShield VS110; 27 dB; 1 unités"
            },
            "special_price": null,
            "price_range": {
                "minimum_price": {
                    "final_price": {
                        "value": 19,
                        "currency": "EUR"
                    }
                },
                "maximum_price": {
                    "final_price": {
                        "value": 19,
                        "currency": "EUR"
                    }
                }
            }
        },
        {
            "id": 171838,
            "uid": "MTcxODM4",
            "sku": "171838",
            "url_key": "lunettes-de-protection-honeywell-svp200-anti-fog-transparent",
            "name": "Lunettes de protection Honeywell SVP200 Anti-Fog, transparent",
            "url_suffix": ".html",
            "small_image": {
                "url": "https://verkter.mobsdev.com/media/catalog/product/cache/6b16b4ea4d2e3af4903f25a28e002cb2/1/7/171838_p1.jpg",
                "label": "Lunettes de protection Honeywell SVP200 Anti-Fog, transparent"
            },
            "special_price": null,
            "price_range": {
                "minimum_price": {
                    "final_price": {
                        "value": 3.7,
                        "currency": "EUR"
                    }
                },
                "maximum_price": {
                    "final_price": {
                        "value": 3.7,
                        "currency": "EUR"
                    }
                }
            }
        }
    ];

    const relatedItems = useMemo(
        () =>
            noitems.map((item) => {
                const productLink = resourceUrl(`/${item.url_key}${item.url_suffix || ''}`);
                return (
                    <div key={item.name} className={classes.item}>
                        <Checkbox
                            field="product_linked"
                            label="includeSimpleProduct"
                           /* label={formatMessage({
                                id: 'productOptions.includeSimpleProduct',
                                defaultMessage: 'Include Simple product'
                            })}*/
                            id={item.uid}
                        />
                        <div className={classes.linkedProductPrice}>
                            <Price
                                value={item.price_range.maximum_price.final_price.value}
                                currencyCode={item.price_range.maximum_price.final_price.currency}
                            />
                        </div>
                        <Link
                            to={productLink}
                            className={classes.images}
                        >
                            <Image
                                alt={item.small_image.label}
                                classes={{
                                    image: classes.root,
                                    root: classes.imageContainer
                                }}
                                height={IMAGE_HEIGHT}
                                resource={item.small_image.url}
                                widths={IMAGE_WIDTHS}
                            />
                        </Link>
                        {/*<Link
                            to={productLink}
                            className={classes.name}
                        >
                            <span className={classes.linkedProductName} >{item.name}</span>
                        </Link>*/}

                        {/*<ProductOptions
                            options={options}
                            classes={{
                                options: classes.options,
                                optionLabel: classes.optionLabel
                            }}
                        />
                        <div className={classes.quantity}>
                            <Quantity
                                itemId={item.id}
                                initialValue={quantity}
                                onChange={handleUpdateItemQuantity}
                            />
                        </div>*/}



                        <div className={classes.block_quantity}>
                            <span className={classes.text_specification}>
                                <FormattedMessage
                                    id={'linked.quantity'}
                                    defaultMessage={'Vnt.'}
                                />
                            </span>
                            <QuantityFields
                                uid={item.uid}
                                itemId={item.id}
                                initialValue={1}
                                label={item.name}
                                min={0}
                                // onChange={'onChange' + item.id}
                            />
                            {/*<div className={classes.block_quantity__chooseBlock}>
                                <input className={classes.block_quantity__number} name="quantityNumber" type="text" min="1"
                                       value="1" />
                                <button className={classes.block_quantity__up}></button>
                                <button className={classes.block_quantity__down}></button>
                            </div>*/}
                        </div>

                        {/*<section key={item.uid} className={classes.quantity}>
                            <span className={classes.quantityTitle}>
                                <FormattedMessage
                                    id={'global.quantity'}
                                    defaultMessage={'Vnt.'}
                                />
                            </span>
                            <QuantityFields
                                classes={{ root: classes.quantityRoot }}
                                min={1}
                                // message={errors.get('quantity')}
                            />
                        </section>*/}



                    </div>
                );
            }),
        [noitems]
    );

    return (
        <Fragment>
        <div className={classes.container}>
            <h3 className={classes.heading}>
                <FormattedMessage
                    id={'linkedProducts.related'}
                    defaultMessage={'Papildomai galite užsakyti šias prekes ar paslaugas pigiau:'}
                />
            </h3>
            <div className={classes.items}>{relatedItems}</div>
        </div>
        </Fragment>
    );
};

LinkedProducts.propTypes = {
    classes: shape({
        block_quantity__up: string,
        block_quantity__button: string,
        block_quantity__number: string,
        block_quantity__chooseBlock: string,
        block_quantity: string,
        text_specification: string,
        // linkedProduct: string,
        imageLinkedProduct: string,
        linkedProductPrice: string,
        linkedProductName: string,
        container: string,
        quantity: string,
        quantityTitle: string,
        // image: string,
        // imageContainer: string,
        // name: string,

        // heading: string,
        // root: string
    }),
    /*productDetails: shape({
        __typename: string,
        name: string,
        description: string,
        // id: number,
        string: string,
        // stock_status: string,
        sku: string.isRequired,
        price: shape({
            __typename: string,
            // regularPrice: shape({
            //     amount: shape({
                    currency: string.isRequired,
                    value: number.isRequired
                // })
            // }).isRequired
        }).isRequired,
    }).isRequired,*/
    // productDetails: oneOfType([string, array])
};

export default LinkedProducts;
