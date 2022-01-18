import { gql } from '@apollo/client';

export const ProductLinkedProductsFragment = gql`
    fragment ProductLinkedProductsFragment on ProductInterface {
        related_products {
            id
            uid
            sku
            url_key
            name
            url_suffix
            small_image {
                url
                label
            }
            special_price
            price_range {
                minimum_price {
                    final_price {
                        value
                        currency
                    }
                }
                maximum_price {
                    final_price {
                        value
                        currency
                    }
                }
            }
        }
    }
`;
