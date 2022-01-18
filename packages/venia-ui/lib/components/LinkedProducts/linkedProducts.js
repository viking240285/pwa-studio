import React, { useMemo, Fragment } from "react";
import { FormattedMessage } from 'react-intl';
import {array, number, oneOfType, shape, string} from "prop-types";
import {useStyle} from "../../classify";
import defaultClasses from "./linkedProducts.module.css";
import LinkedProductItem from './item';
// import { Link } from 'react-router-dom';
// import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
// import Image from "@magento/venia-ui/lib/components/Image";
// import Price from '@magento/venia-ui/lib/components/Price';
// import {UNCONSTRAINED_SIZE_KEY} from "@magento/peregrine/lib/talons/Image/useImage";
// import Checkbox from "../Checkbox";
// import GalleryItem from "../Gallery/item";

// import ErrorView from "@magento/venia-ui/lib/components/ErrorView";
// import GalleryItemShimmer from "../Gallery/item.shimmer";
// import { gql, useQuery } from '@apollo/client';
// import { fullPageLoadingIndicator } from "@magento/venia-ui/lib/components/LoadingIndicator";
// import GalleryItemShimmer from "../RelatedProducts/item.shimmer";
// import GalleryItem from "../RelatedProducts/item";
// import {QuantityFields} from "../CartPage/ProductListing/quantity";
// import defaultClasses from "../RelatedProducts/gallery.module.css
// import { UNCONSTRAINED_SIZE_KEY } from "@magento/peregrine/lib/talons/Image/useImage";

const LinkedProducts = props => {
    const {
        // classesName,
        productLinkedItems,
        // mediaGalleryEntries,
        // options
    } = props;

    // const classes = useStyle(defaultClasses, classesName);
    const classes = useStyle(defaultClasses);
    // console.log('classesName >>', classesName);
    // console.log('classes >>', classes);

    /*const noitems = [
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
    ];*/


    const linkedItems = useMemo(
        () =>
            productLinkedItems.map((item) => {
                console.log('item >',item);
                if (item === null) {
                    return "";
                }
                return (
                    <LinkedProductItem
                        key={item.id}
                        item={item}
                    />
                );
            }),
        [ productLinkedItems ]
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
            <div className={classes.items}>{linkedItems}</div>
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
