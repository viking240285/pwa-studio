import React, { useMemo } from 'react';
import { string, shape, array } from 'prop-types';

import { useStyle } from '../../classify';
import GalleryItem from './item';
import GalleryItemShimmer from './item.shimmer';
import defaultClasses from './gallery.module.css';
import { useGallery } from '@magento/peregrine/lib/talons/Gallery/useGallery';
import { useRelatedProducts } from './useRelatedProducts';
import {fullPageLoadingIndicator} from "../LoadingIndicator";
import ErrorView from "../ErrorView";

/**
 * Renders a Gallery of items. If items is an array of nulls Gallery will render
 * a placeholder item for each.
 *
 * @params {Array} props.items an array of items to render
 */
const RelatedProducts = props => {
    // const { items } = props;
    const { sku, classesName } = props;
    console.log('props>>>>>',props);
    const relatedProps = useRelatedProducts(sku);
    const { items, loading, errors } = relatedProps;
    // const { items } = relatedProps;
    const classes = useStyle(defaultClasses, classesName);
    const talonProps = useGallery();
    const { storeConfig } = talonProps;
    console.log('storeConfig>>>>>',storeConfig);
    console.log('items>>>>>',items);
    console.log('loading>>>>>',loading);
    console.log('errors>>>>>',errors);

    /*if (!items) {
        if (loading) {
            return fullPageLoadingIndicator;
        }

        if (errors) {
            return <ErrorView message={error.message} />;
        }
    }*/

    let noitems = [
        {
            "id": 110080,
            "uid": "MTEwMDgw",
            "sku": "110080",
            "url_key": "cache-oreilles-pour-diminuer-le-bruit-honeywell-verishield-vs110-27-db-1-unites",
            "name": "Cache-oreilles pour diminuer le bruit Honeywell VeriShield VS110; 27 dB; 1 unités",
            "url_suffix": ".html",
            "small_image": {
                "url": "https://verkter.mobsdev.com/media/catalog/product/placeholder/default/verkter_logo_blank_JPG_5.jpg"
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
                "url": "https://verkter.mobsdev.com/media/catalog/product/cache/6b16b4ea4d2e3af4903f25a28e002cb2/1/7/171838_p1.jpg"
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
    const galleryItems = useMemo(
        () =>
            noitems.map((item, index) => {
                if (item === null) {
                    console.log('null>>>>>',item);
                    return <GalleryItemShimmer key={index} />;
                }
                console.log('item>>>>>',item);
                return (
                    <GalleryItem
                        uid={item.uid}
                        key={item.id}
                        item={item}
                        storeConfig={storeConfig}
                    />
                );
            }),
        [noitems, storeConfig]
    );

    return (
        <div className={classes.root} aria-live="polite" aria-busy="false">
            <div className={classes.items}>{galleryItems}</div>
        </div>
    );
};

RelatedProducts.propTypes = {
    classes: shape({
        filters: string,
        items: string,
        pagination: string,
        root: string
    }),
    // items: array.isRequired
    items: array,
    // uid: string,

};

export default RelatedProducts;
