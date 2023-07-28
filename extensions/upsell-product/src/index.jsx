import React, {useEffect, useState} from 'react';
import { Banner, BlockStack, render, useApplyCartLinesChange, useCartLines, useSettings } from '@shopify/checkout-ui-extensions-react';

render('Checkout::CartLines::RenderAfter', () => <App/>);

function App() {
    const { upsellProductVariantID, isAddUpsellProductToRelatedProducts, relatedProductsIDs, upsellProductBannerTitle, upsellProductBannerDescription,} = useSettings();
    const cartLines = useCartLines();
    const applyCartLinesChange = useApplyCartLinesChange();
    const [showUpsellBanner, setShowUpsellBanner] = useState(false);
    const productGID = 'gid://shopify/Product/';

    useEffect(() => {
        if (showUpsellBanner) {
            const timer = setTimeout(() => setShowUpsellBanner(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showUpsellBanner]);

    function isUpsellProductInCart() {
        return !!cartLines.find(item => item.merchandise.id === upsellProductVariantID);
    }

    function isAddUpsellProduct() {
        return isAddUpsellProductToRelatedProducts ? isRelatedProductsInOrder() : true;
    }

    function isRelatedProductsInOrder() {
        if(!relatedProductsIDs) return false;
        const relatedProductsIDsArray = relatedProductsIDs.split(', ');
        const relatedProductsGIDsArray = relatedProductsIDsArray.map(relatedProductsIDs => `${productGID}${relatedProductsIDs}`);
        return cartLines.some(item => relatedProductsGIDsArray.includes(item.merchandise.product.id));
    }

    function addUpsellProductToCart() {
        applyCartLinesChange({
            type: "addCartLine",
            merchandiseId: upsellProductVariantID,
            quantity: 1
        }).then(result => {
            if (result?.type === 'success') {
                setShowUpsellBanner(true);
            }
        })
    }

    if (upsellProductVariantID && !isUpsellProductInCart() && isAddUpsellProduct()) {
        addUpsellProductToCart();
    }

    return (
        showUpsellBanner && (
            <BlockStack>
                <Banner status="success"
                        title={upsellProductBannerTitle ?? 'Upsell product'}
                >
                    {upsellProductBannerDescription ?? 'Upsell product was successfully added to your order'}
                </Banner>
            </BlockStack>
        )
    );
}