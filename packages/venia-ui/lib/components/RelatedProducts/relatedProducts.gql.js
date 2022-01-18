import { gql } from '@apollo/client';
// import {GET_STORE_CONFIG_DATA} from "@magento/peregrine/lib/talons/Gallery/gallery.gql.ce";

export const GET_RELATED_PRODUCTS_DATA = gql`
    query GetRelatedProductsData($sku: String!) {
#        products(search: $search) {
#            items {
#                id
#                sku
#                name
#            }
#        }
        products(filter: { sku: { eq: $sku } }) {
            items {
                id
                uid
                sku
                name
                related_products {
                    id
                    uid
                    sku
                    name
                    small_image {
                        label
                        url
                    }
                    url_key
                    url_suffix
                    price_range {
                        minimum_price {
                            regular_price {
                                currency
                                value
                            }
                        }
                    }
                }
            }
        }
    }
`;

export default {
    getRelatedProductsQuery: GET_RELATED_PRODUCTS_DATA
};
