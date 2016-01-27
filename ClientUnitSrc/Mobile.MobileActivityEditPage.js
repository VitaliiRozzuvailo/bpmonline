Terrasoft.LastLoadedPageData = {
	controllerName: "ActivityEditPage.Controller",
	viewXType: "activityeditpageview"
};

Ext.define("ActivityEditPage.View", {
	extend: "Terrasoft.view.BaseEditPage",
	xtype: "activityeditpageview",
	config: {
		id: "ActivityEditPage"
	}
});

Ext.define("ActivityEditPage.Controller", {
	extend: "Terrasoft.controller.BaseEditPage",

	statics: {
		Model: Activity
	},

	config: {
		refs: {
			view: "#ActivityEditPage"
		}
	},

	/**
	 * @protected
	 * @virtual
	 */
	refreshDirtyDataByColumns: function(record, columns) {
		var pageRecord = this.record;
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			pageRecord.set(column, record.get(column), true);
		}
	},

	/**
	 * @protected
	 * @virtual
	 */
	onDataSavedSuccessfully: function() {
		var pageHistoryItem = this.getPageHistoryItem();
		if (pageHistoryItem && pageHistoryItem.getParent()) {
			var gridPageController = Terrasoft.PageNavigator.getHistoryItemController(pageHistoryItem.getParent());
			if (Ext.isFunction(gridPageController.getActivityGridMode)) {
				var gridMode = gridPageController.getActivityGridMode();
				if (gridMode === Terrasoft.Configuration.ActivityGridModeTypes.Schedule) {
					Terrasoft.PageNavigator.markPreviousPagesAsDirty();
					this.removeModelAssociations();
					Terrasoft.Router.back();
					Terrasoft.Mask.hide();
					return;
				}
			}
		}
		this.callParent(arguments);
	},

	/**
	 * @protected
	 * @virtual
	 */
	onEmbeddedDetailItemApplied: function(record, detailItem) {
		if (record.modelName === "ActivityParticipant" && record.phantom) {
			Terrasoft.Configuration.focusDetailItemFieldByColumnName("Participant", detailItem);
		}
		this.callParent(arguments);
	}

});