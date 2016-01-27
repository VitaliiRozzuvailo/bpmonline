Terrasoft.LastLoadedPageData = {
	controllerName: 'ActivityPreviewPage.Controller',
	viewXType: 'activitypreviewpageview'
};

Ext.define('ActivityPreviewPage.View', {
	extend: 'Terrasoft.view.BasePreviewPage',
	xtype: 'activitypreviewpageview',
	config: {
		id: 'ActivityPreviewPage'
	}
});

Ext.define('ActivityPreviewPage.Controller', {
	extend: 'Terrasoft.controller.BasePreviewPage',
	statics: {
		Model: Activity
	},
	config: {
		refs: {
			view: '#ActivityPreviewPage'
		}
	},
	refreshDirtyDataByColumns: function() {
		this.refreshDirtyData();
	}
	
});