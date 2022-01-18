import React, {useCallback, useState} from 'react';
import { FormattedMessage } from 'react-intl';
import { Info } from 'react-feather';
import { string, number, shape } from 'prop-types';
import { Link } from 'react-router-dom';
import Price from '@magento/venia-ui/lib/components/Price';
import { UNCONSTRAINED_SIZE_KEY } from '@magento/peregrine/lib/talons/Image/useImage';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';

import { useStyle } from '../../classify';
import Image from '../Image';
import defaultClasses from './item.module.css';

import Checkbox from "../Checkbox";
import Quantity, { QuantityFields } from '../CartPage/ProductListing/quantity';

// import { useGalleryItem } from '@magento/peregrine/lib/talons/Gallery/useGalleryItem';
// import WishlistGalleryButton from '../Wishlist/AddToListButton';
// import GalleryItemShimmer from './item.shimmer';
// import AddToCartbutton from '../Gallery/addToCartButton';
// import LinkedProducts from "./linkedProducts";


const LinkedProductItem = props => {
    const {
        // onClick,
        item,
    } = props;
    // } = useGalleryItem(props);
    console.log('LinkedProductItem = ',item);

    const {
        currency,
        image,
        name,
        options,
        quantity,
        stockStatus,
        unitPrice,
        urlKey,
        urlSuffix
    } = item;
    console.log('quantity >>>>>>',quantity);

    // const [setQuantity] = useState(1);

    const handleClick = useCallback(() => {
        // onClick(item.id);
        console.log('Click checkbox item id>',item.id);
        // }, [item.id, onClick]);
    }, [item.id]);

    // const handleClick = useCallback(() => {
    //     setExpanded(value => !value);
    // }, [setExpanded]);

    const mockOnChange = useCallback((event) => {
        console.log('value> ',event);
        quantity;
        // setQuantity(event)
        console.log('mock item id>',item.id);
    }, [quantity, item.id]);

    const mockOnChange1 = event => {
        // console.log('quantity ',quantity);
        console.log(event)
    }

/*    const defaultProps = {
        initialValue: 1,
        itemId: 'item1',
        label: 'Test Quantity',
        min: 0,
        onChange: mockOnChange,
        message: ''
    };*/

    const classes = useStyle(defaultClasses, props.classes);

    if (!item) {
        // return <GalleryItemShimmer classes={classes} />;
        return 'Empty';
    }


    const IMAGE_WIDTH = 50;
    const IMAGE_HEIGHT = 50;

    const IMAGE_WIDTHS = new Map()
        .set(50, IMAGE_WIDTH)
        .set(UNCONSTRAINED_SIZE_KEY, 50);

    const productLink = resourceUrl(`/${item.url_key}${item.url_suffix || ''}`);

    return (
        <div key={item.name} className={classes.linkedProducts}>
            <Checkbox
                classes={classes.linkedProductsCheckbox}
                field={`product_linked_${item.id}`}
                // fieldValue={!!isSelected}
                // label={label}
                // ariaLabel={ariaLabel}
                data-cy="LinkedProductItemDefault-checkbox"

                // field="product_linked"
                // label="includeSimpleProduct"
                 // label={formatMessage({
                 //     id: 'productOptions.includeSimpleProduct',
                 //     defaultMessage: 'Include Simple product'
                 // })}
                // id={item.uid}
                value={item.sku}
                onClick={handleClick}
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
            <Link
                to={productLink}
                className={classes.name}
            >
                <span className={classes.linkedProductName} >{item.name}</span>
            </Link>

            {/*<Quantity {...defaultProps} />*/}
            <Quantity
                initialValue={quantity}
                itemId={`${item.id}`}
                label={item.name}
                min={0}
                onChange={mockOnChange}
                message={''}
            />

            {/*<QuantityFields
                // classes={{ root: classes.quantityRoot }}
                min={1}
                // message={errors.get('quantity')}
                itemId={item.id}
                initialValue={1}
                maskInput={`quantity_${item.id}`}
                // initialValue={quantity}
                // initialValue={quantity}
                // onChange={handleUpdateItemQuantity}
            />*/}

            {/*<div className={classes.block_quantity}>
                            <span className={classes.text_specification}>
                                <FormattedMessage
                                    id={'linked.quantity'}
                                    defaultMessage={'Vnt.'}
                                />
                            </span>
                <div className={classes.block_quantity__chooseBlock}>
                    <input className={classes.block_quantity__number} name="quantityNumber" type="text" min="1"
                           value="1" />
                    <button className={classes.block_quantity__up}></button>
                    <button className={classes.block_quantity__down}></button>
                </div>
            </div>*/}
        </div>
    );
}

LinkedProductItem.propTypes = {
    classes: shape({
        block_quantity__up: string,
        block_quantity__button: string,
        block_quantity__number: string,
        block_quantity__chooseBlock: string,
        block_quantity: string,
        text_specification: string,
        imageLinkedProduct: string,
        linkedProductPrice: string,
        linkedProductName: string,
        container: string,
        quantity: string,
        quantityTitle: string,
        linkedProducts: string,
        linkedProductsCheckbox: string,
    }),

};
export default LinkedProductItem;
