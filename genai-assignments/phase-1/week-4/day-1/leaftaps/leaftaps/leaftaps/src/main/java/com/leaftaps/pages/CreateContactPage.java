
/**
 * Page object representing the Create Contact page.
 * Provides methods to interact with the Create Contact form fields and actions.
 * @author Auto-generated
 */
package com.leaftaps.pages;

import com.framework.selenium.api.design.Locators;
import com.framework.testng.api.base.ProjectSpecificMethods;

public class CreateContactPage extends ProjectSpecificMethods {

    /**
     * Enters the first name in the Create Contact form.
     * @param fName The first name to enter
     * @return The current CreateContactPage instance
     */
    public CreateContactPage enterFirstName(String fName) {
        clearAndType(locateElement(Locators.ID,"firstNameField"),fName);
        reportStep(fName+" first name is entered successfully", "pass");
        return this;
    }

    /**
     * Enters the local first name in the Create Contact form.
     * @param fNameLocal The local first name to enter
     * @return The current CreateContactPage instance
     */
    public CreateContactPage enterFirstNameLocal(String fNameLocal) {
        clearAndType(locateElement(Locators.ID,"createContactForm_firstNameLocal"),fNameLocal);
        reportStep(fNameLocal+" first name (Local) is entered successfully", "pass");
        return this;
    }

    /**
     * Selects the preferred currency from the dropdown.
     * @param currency The currency to select
     * @return The current CreateContactPage instance
     */
    public CreateContactPage selectCurrency(String currency) {
        selectDropDownUsingText(locateElement(Locators.ID,"createContactForm_preferredCurrencyUomId"), currency);
        reportStep(currency+" Currency is selected successfully", "pass");
        return this;
    }

    /**
     * Clicks the Create Contact button to submit the form.
     * @return The current CreateContactPage instance
     */
    public CreateContactPage clickCreateContact() {
        click(locateElement(Locators.NAME, "submitButton"));
        reportStep("Create Contact button is clicked successfully", "pass");
        return this;
    }

}