package com.leaftaps.pages;

import com.framework.selenium.api.design.Locators;
import com.framework.testng.api.base.ProjectSpecificMethods;

/**
 * Page object representing the View Lead page.
 * Provides methods to verify lead details and perform actions like delete.
 * @author Auto-generated
 */
public class ViewLeadPage extends ProjectSpecificMethods {

	/**
	 * Verifies the first name displayed on the View Lead page.
	 * @param fName The expected first name
	 * @return The current ViewLeadPage instance
	 */
	public ViewLeadPage verifyFirstName(String fName) {
		verifyExactText(locateElement(Locators.ID,"viewLead_firstName_sp"), fName);
		reportStep(fName+" is matching with first name", "pass");
		return this;
	}

	/**
	 * Verifies the company name displayed on the View Lead page.
	 * @param CompanyName The expected company name
	 * @return The current ViewLeadPage instance
	 */
	public ViewLeadPage verifyCompanyName(String CompanyName) {
		verifyPartialText(locateElement(Locators.ID,"viewLead_companyName_sp"), CompanyName);
		return this;
	}

	/**
	 * Clicks the Delete link to delete the lead.
	 * @return A new MyLeadsPage instance
	 */
	public MyLeadsPage clickDeleteLeadLink() {
		click(locateElement(Locators.LINK_TEXT,"Delete"));
		reportStep(" Clicked on DeleteLead Button", "pass");
		return new MyLeadsPage();
	}

}
