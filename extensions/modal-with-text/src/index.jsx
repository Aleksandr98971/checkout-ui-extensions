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
    const {main_text, link_text, modal_text, province_codes} = useSettings();
    const {provinceCode} = useShippingAddress();

    const text = main_text ?? "";
    const linkText = link_text ?? "link";
    const modalText = modal_text ?? "";
    const provinceCodes = province_codes ?? "";

    const isProvinceCode = provinceCodes.includes(provinceCode);
    const textParts = text.split(/( +)/);

    if (!isProvinceCode) {
        return null;
    }

    const modalComponent = (
        <Modal padding>
            <TextBlock>
                {modalText}
            </TextBlock>
        </Modal>
    );

    const linkComponent = (
        <Link overlay={modalComponent}>
            {linkText}
        </Link>
    );

    return (
        <BlockStack>
            <TextBlock>
                {
                    textParts.map(textPart => {
                        return textPart.includes('{{link}}') ? linkComponent : textPart
                    })
                }
            </TextBlock>
        </BlockStack>
    );
}