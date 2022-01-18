import { useQuery } from '@apollo/client';

// import mergeOperations from '../../util/shallowMerge';
import operations from './relatedProducts.gql';

// import { fullPageLoadingIndicator } from "@magento/venia-ui/lib/components/LoadingIndicator";
// import ErrorView from "@magento/venia-ui/lib/components/ErrorView";

export const useRelatedProducts = (props = {}) => {
    // const operations = mergeOperations(defaultOperations, props.operations);
    const productSku = props;
    console.log('<<<<<<<',productSku);

    const { loading, error, data } = useQuery(operations.getRelatedProductsQuery, {
        variables: { sku: productSku },
        fetchPolicy: 'cache-and-network'
    });

    // if (!data) {
    //     if (loading) {
    //         return fullPageLoadingIndicator;
    //     }
    //
    //     if (error) {
    //         return <ErrorView message={error.message} />;
    //     }
    // }
    if (!data) {
        const items = null;
        // if (loading ) {
        return {
            items,
            error,
            loading
        };
        // }

        // if (error) {
        //     return <ErrorView message={error.message} />;
        // }
    }

    // const relatedProducts = relatedProductsData ? data.products.items[0].related_products : null;
    console.log('data! >>>>>',data);
    const product = data.products.items.length > 0 ? data.products.items[0] : null;

    const relatedProductsData = product ? product.related_products : null;
    const items = relatedProductsData.length > 0 ? relatedProductsData : null;

    console.log('$$$$$$$$ ', items);
    return {
        items,
        error,
        loading
    };
};
