import React from 'react';
import {
    render,
    BlockStack,
    TextBlock,
    Link,
    Modal,
    useSettings,
    useShippingAddress
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::Dynamic::Render', () => <App/>);

function App() {
    const {text, link_text, modal_text, province_codes} = useSettings();

    if (!text || text.split('{{link}}').length !== 2 | !link_text || !modal_text || !province_codes) {
        return null;
    }

    const {provinceCode} = useShippingAddress();
    const provinceCodesArray = province_codes.split(', ');
    const isProvinceCode = provinceCodesArray.includes(provinceCode);

    if (!isProvinceCode) {
        return null;
    }

    const textParts = text.split('{{link}}');

    return (
        <BlockStack>
            <TextBlock>
                {
                    textParts.map((textPart, index) => (
                        index === 0
                            ? textPart
                            : (<>
                                <Link overlay={
                                    <Modal padding>
                                        <TextBlock>
                                            {modal_text}
                                        </TextBlock>
                                    </Modal>
                                }>
                                    {link_text}
                                </Link>
                                {textPart}
                            </>)
                    ))
                }
            </TextBlock>
        </BlockStack>
    );
}