import {
  reactExtension,
  useBuyerJourneyIntercept,
  useSettings,
  useShippingAddress,
  useTranslate
} from '@shopify/ui-extensions-react/checkout';

import React from "react";

export default reactExtension('purchase.checkout.delivery-address.render-before', () => <Extension/>);

function Extension() {
  const {
    errorMessageGeneralSetting,
    forbiddenAddresses1Setting,
    errorMessageAddresses1Setting,
    forbiddenAddresses2Setting,
    errorMessageAddresses2Setting,
    forbiddenZipCodesSetting,
    errorMessageZipCodeSetting
  } = useSettings();

  const {
    address1,
    address2,
    zip
  } = useShippingAddress();

  const translate = useTranslate();

  let invalidFields = [];
  let validationErrors = [];

  const errorMessageGeneral = errorMessageGeneralSetting || translate('errorMessageGeneral');
  const errorMessageAddresses1 = errorMessageAddresses1Setting || translate('errorMessageAddresses1');
  const errorMessageAddresses2 = errorMessageAddresses2Setting || translate('errorMessageAddresses2');
  const errorMessageZipCode = errorMessageZipCodeSetting || translate('errorMessageZipCodeSetting');
  const forbiddenAddresses1 = forbiddenAddresses1Setting || '';
  const forbiddenAddresses2 = forbiddenAddresses2Setting || '';
  const forbiddenZipCodes = forbiddenZipCodesSetting || '';

  useBuyerJourneyIntercept(({canBlockProgress}) => {
    if (canBlockProgress && !isFieldsValid()) {
      return {
        behavior: `block`,
        reason: `Invalid fields: ${invalidFields.join(', ')}`,
        errors: validationErrors
      }
    }

    return {
      behavior: "allow"
    }
  });

  function isFieldsValid() {
    resetErrors();
    validateField(address1, errorMessageAddresses1, forbiddenAddresses1, 'address1');
    validateField(address2, errorMessageAddresses2, forbiddenAddresses2, 'address2');
    validateField(zip, errorMessageZipCode, forbiddenZipCodes, 'postalCode');
    const isFieldsValid = !validationErrors.length;
    !isFieldsValid && setGlobalError(errorMessageGeneral);
    return isFieldsValid;
  }

  function resetErrors() {
    invalidFields = [];
    validationErrors = [];
  }

  function setGlobalError(errorMessage) {
    validationErrors.push({
      message: errorMessage
    });
  }

  function setError(errorMessage, fieldTarget) {
    invalidFields.push(fieldTarget);
    validationErrors.push({
      message: errorMessage,
      target: `$.cart.deliveryGroups[0].deliveryAddress.${fieldTarget}`
    });
  }

  function interpolateString(string, template, templateValue) {
    return template && templateValue ? string.replace(template, templateValue) : string;
  }

  function getArrayFromString(string) {
    return string ? string.split(', ') : [];
  }

  function validateField(stringToValidate, errorMessage, forbiddenValues, fieldTarget) {
    if(!stringToValidate || !errorMessage || !forbiddenValues || !fieldTarget) return;

    const validateResult = validateStringWordMatch(stringToValidate, forbiddenValues);
    const invalidValues = validateResult.invalidValues;
    const isValid = validateResult.isValid;

    const interpolateErrorMessage = interpolateString(errorMessage, '[forbidden_values]', invalidValues);

    !isValid && setError(interpolateErrorMessage, fieldTarget);
  }

  function validateStringWordMatch(stringToValidate, forbiddenValues) {
    if(!stringToValidate || !forbiddenValues) return;

    const forbiddenValuesArray = getArrayFromString(forbiddenValues);

    const existingForbiddenValues = forbiddenValuesArray.filter((forbiddenValue) => {
      const wordMatchRegExpr = new RegExp(`\\b${forbiddenValue.toLowerCase()}\\b`);
      return wordMatchRegExpr.test(stringToValidate.toLowerCase());
    });

    return {
      isValid: !existingForbiddenValues.length,
      invalidValues: existingForbiddenValues.join(', ')
    };
  }

  return null;
}
