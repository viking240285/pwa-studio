import { gql } from '@apollo/client';

export const GET_LINKED_PRODUCTS = gql`
    query getRelatedProducts($sku: String!) {
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
