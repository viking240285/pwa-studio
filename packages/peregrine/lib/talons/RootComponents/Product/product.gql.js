import { gql } from '@apollo/client';

import { ProductDetailsFragment } from './productDetailFragment.gql';
import { ProductLinkedProductsFragment } from './productLinkedProductsFragment.gql';

export const GET_STORE_CONFIG_DATA = gql`
    query getStoreConfigData {
        storeConfig {
            id
            product_url_suffix
        }
    }
`;

export const GET_PRODUCT_DETAIL_QUERY = gql`
    query getProductDetailForProductPage($urlKey: String!) {
        products(filter: { url_key: { eq: $urlKey } }) {
            items {
                id
                uid
                ...ProductLinkedProductsFragment
                ...ProductDetailsFragment
            }
        }
    }
    ${ProductLinkedProductsFragment}
    ${ProductDetailsFragment}
`;

export default {
    getStoreConfigData: GET_STORE_CONFIG_DATA,
    getProductDetailQuery: GET_PRODUCT_DETAIL_QUERY
};
