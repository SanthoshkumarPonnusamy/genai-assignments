package com.leaftaps.pages;

import com.framework.selenium.api.design.Locators;
import com.framework.testng.api.base.ProjectSpecificMethods;


/**
 * Page object representing the Find Lead page.
 * Provides methods to search for leads and interact with search results.
 * @author Auto-generated
 */
public class FindLeadPage extends ProjectSpecificMethods {

	/**
	 * Enters the first name in the Find Lead form.
	 * @param findfirstname The first name to search for
	 * @return The current FindLeadPage instance
	 */
	public FindLeadPage enterLeadName(String findfirstname) {
		clearAndType(locateElement(Locators.XPATH,"(//input[@name='firstName'])[3]"), findfirstname);
		reportStep(findfirstname +" first name is entered successfully", "pass");
		return this;
	}

	/**
	 * Enters the lead ID in the Find Lead form.
	 * @param id The lead ID to search for
	 * @return The current FindLeadPage instance
	 */
	public FindLeadPage enterLeadID(String id) {
		clearAndType(locateElement(Locators.NAME,"id"), id);
		reportStep(id +" first name is entered successfully", "pass");
		return this;
	}

	/**
	 * Clicks the Find Leads button to perform the search.
	 * @return The current FindLeadPage instance
	 */
	public FindLeadPage clickFindleadsButton() {
		click(locateElement(Locators.XPATH,"//button[text()='Find Leads']"));
		reportStep("FindLeads Button is clicked", "pass");
		return this;
	}

	/**
	 * Gets the lead ID of the first resulting lead in the search results.
	 * @return The lead ID as a String
	 */
	public String getFirstResultingLead() {
		return getElementText(locateElement(Locators.XPATH,"(//div[@class='x-grid3-cell-inner x-grid3-col-partyId']/a)[1]"));
	}

	/**
	 * Clicks the first resulting lead in the search results.
	 * @return A new ViewLeadPage instance
	 */
	public ViewLeadPage clickFirstResultingLead() {
		click(locateElement(Locators.XPATH,"(//div[@class='x-grid3-cell-inner x-grid3-col-partyId']/a)[1]"));
		reportStep("FirstResultingLead Id is clicke", "pass");
		return new ViewLeadPage();
	}

}
