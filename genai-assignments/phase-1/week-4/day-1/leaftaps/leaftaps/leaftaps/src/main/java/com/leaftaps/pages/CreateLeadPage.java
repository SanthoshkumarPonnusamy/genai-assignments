package com.leaftaps.pages;

import com.framework.selenium.api.design.Locators;
import com.framework.testng.api.base.ProjectSpecificMethods;

/**
 * Page object representing the Create Lead page.
 * Provides methods to interact with the Create Lead form fields and actions.
 * @author Auto-generated
 */
public class CreateLeadPage extends ProjectSpecificMethods {

    /**
     * Enters the company name in the Create Lead form.
     * @param comName The company name to enter
     * @return The current CreateLeadPage instance
     */
    public CreateLeadPage enterCompanyName(String comName) {
        clearAndType(locateElement("createLeadForm_companyName"), comName);
        reportStep(comName + " company name is entered successfully", "pass");
        return this;
    }

    /**
     * Enters the first name in the Create Lead form.
     * @param fName The first name to enter
     * @return The current CreateLeadPage instance
     */
    public CreateLeadPage enterFirstName(String fName) {
        clearAndType(locateElement("createLeadForm_firstName"), fName);
        reportStep(fName + " first name is entered successfully", "pass");
        return this;
    }

    /**
     * Enters the last name in the Create Lead form.
     * @param lName The last name to enter
     * @return The current CreateLeadPage instance
     */
    public CreateLeadPage enterLastName(String lName) {
        clearAndType(locateElement("createLeadForm_lastName"), lName);
        reportStep(lName + " last name is entered successfully", "pass");
        return this;
    }

    /**
     * Selects the source from the dropdown.
     * @param source The source to select
     * @return The current CreateLeadPage instance
     */
    public CreateLeadPage selectSource(String source) {
        selectDropDownUsingText(locateElement("createLeadForm_dataSourceId"), source);
        reportStep(source + " source is selected successfully", "pass");
        return this;
    }

    /**
     * Clicks the Create Lead button to submit the form.
     * @return A new ViewLeadPage instance
     */
    public ViewLeadPage clickCreateLeadButton() {
        click(locateElement("createLeadForm_submit"));
        reportStep("Create Lead button is clicked successfully", "pass");
        return new ViewLeadPage();
    }

}