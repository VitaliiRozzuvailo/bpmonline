Terrasoft.Configuration.ActivityGridModeTypes = {
	List: "tslist",
	Schedule: "tsschedule"
};

Terrasoft.LastLoadedPageData = {
	controllerName: "ActivityGridPage.Controller",
	viewXType: "activitygridpage"
};

Terrasoft.Configuration.ActivityStatus = {
	NotStarted: "384d4b84-58e6-df11-971b-001d60e938c6",
	InProgress: "394d4b84-58e6-df11-971b-001d60e938c6",
	Finished: "4bdbb88f-58e6-df11-971b-001d60e938c6",
	Canceled: "201cfba8-58e6-df11-971b-001d60e938c6"
};

Ext.define("ActivityGridPage.Store", {
	extend: "Terrasoft.store.BaseStore",
	config: {
		model: "Activity",
		controller: "ActivityGridPage.Controller"
	}
});

Ext.define("ActivityGridPage.View", {
	extend: "Terrasoft.view.BaseGridPage.View",
	xtype: "activitygridpage",
	config: {
		id: "ActivityGridPage",
		grid: {
			xtype: Terrasoft.Configuration.ActivityGridModeTypes.Schedule,
			isFirePhantomItemEvents: true
		},
		ownerButton: false
	},

	/**
	 * @private
	 */
	applyOwnerButton: function(value) {
		if (!value) {
			return false;
		}
		var config = {
			docked: "right",
			cls: "x-activity-grid-owner-button"
		};
		return Ext.factory(config, "Ext.Button", this.getOwnerButton());
	},

	/**
	 * @private
	 */
	updateOwnerButton: function(newButton, oldButton) {
		if (newButton) {
			this.setOwnerButtonImage(null);
			var filterPanel = this.getFilterPanel();
			filterPanel.add(newButton);
		}
		if (oldButton) {
			Ext.destroy(oldButton);
		}
	},

	/**
	 * @private
	 */
	setOwnerButtonImage: function(image) {
		var ownerButton = this.getOwnerButton();
		if (image) {
			ownerButton.removeCls("x-owner-default-image");
		} else {
			ownerButton.addCls("x-owner-default-image");
			image = this.getDefaultOwnerImage();
		}
		ownerButton.setIcon(image);
	},

	/**
	 * @private
	 */
	getDefaultOwnerImage: function() {
		var defaultImageId = "e9f90b9c-4788-4853-a318-6e2f48d4157d";
		var base64str = Terrasoft.IconsConfiguration.get(defaultImageId);
		return Terrasoft.util.getBase64ImageUrl(base64str);
	},

	/**
	 * @private
	 */
	onScheduleInitialize: function(schedule) {
		var periodFilter = this.getFilterPanel().getModuleByName("ActivityPeriodFilter");
		if (periodFilter) {
			var periodFilterComponent = periodFilter.getComponent();
			var startDate = periodFilterComponent.getStartDate();
			var dueDate = periodFilterComponent.getDueDate();
			if (!startDate && !dueDate) {
				var period = this.getDefaultPeriod();
				periodFilterComponent.setPeriod(period);
			}
			schedule.setPeriod({
				start: periodFilterComponent.getStartDate(),
				due: periodFilterComponent.getDueDate()
			});
		}
	},

	/**
	 * @private
	 */
	getDefaultPeriod: function() {
		return (Ext.os.is.Phone ? Terrasoft.CalendarPeriod.Today : Terrasoft.CalendarPeriod.CurrentWeek);
	},

	/**
	 * @private
	 */
	updateCalendarPickerToolbar: function() {
		var periodFilter = this.getFilterPanel().getModuleByName("ActivityPeriodFilter");
		if (periodFilter) {
			var periodFilterComponent = periodFilter.getComponent();
			var picker = periodFilterComponent.getCalendarPicker();
			var grid = this.getGrid();
			picker.setToolbar({
				clearButton: {
					hidden: (grid.xtype === Terrasoft.Configuration.ActivityGridModeTypes.Schedule)
				}
			});
		}
	},

	/**
	 * @protected
	 * @virtual
	 */
	applyGrid: function(newConfig) {
		if (!this.initializedByController) {
			return newConfig;
		}
		if (newConfig.xtype === Terrasoft.Configuration.ActivityGridModeTypes.Schedule) {
			newConfig.listeners = {
				scope: this,
				initialize: function(el) {
					this.onScheduleInitialize(el);
					this.fireEvent("initializegrid", el);
				},
				beforeinitialize: Ext.emptyFn
			};
			newConfig.startHour = parseInt(Terrasoft.SysSettings.SchedulerDisplayTimingStart, 10);
			newConfig.columnsBindingConfig = {
				status: function(record) {
					if (record.get("Status.Finish")) {
						return Terrasoft.ScheduleItemStatus.Done;
					} else if (record.get("DueDate") < new Date()) {
						return Terrasoft.ScheduleItemStatus.Overdue;
					} else {
						return Terrasoft.ScheduleItemStatus.New;
					}
				}
			};
		}
		newConfig.store = "ActivityGridPage.Store";
		return this.callParent(arguments);
	}

}, function() {
	Terrasoft.util.writeStyles(
		".x-activity-grid-owner-button {",
		"padding-left: 20px;",
		"top: -3px;",
		"}",
		".x-activity-grid-owner-button .x-button-icon {",
		"background-size: cover;",
		"border-radius: 18px;",
		"-webkit-border-radius: 18px;",
		"}",
		".x-activity-grid-owner-button.x-owner-default-image .x-button-icon {",
		"background-size: 30px;",
		"border: 1px solid #C8C8C8;",
		"}",
		"#ActivityGridPage .x-navigation-panel, #ActivityGridPage > .x-dock > .x-dock-body {",
		"overflow: visible;",
		"}",
		".x-activity-grid-edit-panel {",
		"margin-right: 14px;",
		"margin-left: 14px;",
		"}",
		".x-activity-grid-status-button {",
		"margin-right: 1px;",
		"width: 100%;",
		"}",
		".x-activity-grid-status-picker-button {",
		"width: 36px",
		"}",
		".x-button-primary-blue .x-activity-grid-status-picker-button-icon,",
		".x-button-primary-blue.x-button-pressing .x-activity-grid-status-picker-button-icon {",
		"width: 0!important;",
		"height: 0!important;",
		"border: 5px solid transparent;",
		"border-top-color: white;",
		"margin-top: 5px!important",
		"}",
		".x-select-picker .x-list .x-list-item.x-picker-menu-group .x-list-title {",
		"font-size: 19px;",
		"font-weight: 600;",
		"margin-left: -10px;",
		"}"
	);
});

Ext.define("ActivityGridPage.Controller", {
	extend: "Terrasoft.controller.BaseGridPage",

	statics: {
		Model: Activity
	},

	config: {
		refs: {
			view: "#ActivityGridPage"
		}
	},

	/**
	 * @private
	 */
	profileData: null,

	/**
	 * @private
	 */
	initializeOwnerButton: function() {
		var view = this.getView();
		view.setOwnerButton(true);
		var ownerButton = view.getOwnerButton();
		ownerButton.on("tap", this.onOwnerButtonTap, this);
		this.setOwnerButtonImage(this.profileData.ownerId);
	},

	/**
	 * @private
	 */
	onActivityProfileDataLoaded: function(profileData) {
		var view = this.getView();
		var gridConfig = view.getGrid();
		if (!profileData.ownerId) {
			profileData.ownerId = Terrasoft.CurrentUserInfo.contactId;
		}
		this.initializeOwnerButton();
		if (profileData.gridMode) {
			gridConfig.xtype = profileData.gridMode;
		}
		if (gridConfig.xtype === Terrasoft.Configuration.ActivityGridModeTypes.Schedule &&
			profileData.scheduleTimeScale) {
			gridConfig.timeScale = profileData.scheduleTimeScale;
		}
		var filterPanel = view.getFilterPanel();
		this.initializeActionsButton();
		var periodFilter = filterPanel.getModuleByName("ActivityPeriodFilter");
		var periodFilterComponent = periodFilter.getComponent();
		var period = profileData.period;
		if (!Ext.isEmpty(period)) {
			if (Ext.isObject(period)) {
				var startDate = period.startDate ? new Date(period.startDate) : null;
				var dueDate = period.dueDate ? new Date(period.dueDate) : null;
				periodFilterComponent.setDatePeriod(startDate, dueDate, true);
			} else {
				periodFilterComponent.setPeriod(period);
			}
		} else {
			period = view.getDefaultPeriod();
			periodFilterComponent.setPeriod(period);
		}
		view.setGrid(gridConfig);
		this.initializeQueryConfig();
		view.updateCalendarPickerToolbar();
		periodFilterComponent.on("periodchanged", this.onPeriodFilterChange, this, null, "before");
		this.superclass.launch.call(this);
		Terrasoft.Mask.hide();
	},

	/**
	 * @private
	 */
	initializeActionsButton: function() {
		var navigationPanel = this.getView().getNavigationPanel();
		navigationPanel.addButton({
			cls: "x-button-secondary",
			iconCls: "x-actions",
			listeners: {
				tap: this.onActionsButtonTap,
				scope: this
			}
		}, 0);
	},

	/**
	 * @private
	 */
	setOwnerButtonImage: function(ownerId) {
		Contact.load(ownerId, {
			success: function(record) {
				var view = this.getView();
				var imageUrl;
				if (record) {
					var contactPhotoRecord = record.get("Photo");
					imageUrl = contactPhotoRecord.get("PreviewData");
				}
				if (imageUrl) {
					imageUrl = "\"" + Terrasoft.util.encodeURI(imageUrl)  + "\"";
				}
				view.setOwnerButtonImage(imageUrl);
			},
			queryConfig: Ext.create("Terrasoft.QueryConfig", {
				modelName: "Contact",
				columns: ["Photo.PreviewData"]
			})
		}, this);
	},

	/**
	 * @private
	 */
	loadActivityProfileData: function(config) {
		Terrasoft.MobileProfileManager.loadData({
			key: "ActivityGrid",
			success: function(profileData) {
				if (profileData) {
					profileData = Ext.JSON.decode(profileData.get("Value"), true);
				} else {
					profileData = {};
				}
				this.profileData = profileData;
				Ext.callback(config.success, config.scope, [profileData]);
			},
			failure: config.failure,
			scope: config.scope
		});
	},

	/**
	 * @private
	 */
	saveActivityProfileData: function() {
		var profileValue = JSON.stringify(this.profileData);
		Terrasoft.MobileProfileManager.saveData({
				key: "ActivityGrid",
				value: profileValue,
				failure: function(exception) {
					Terrasoft.MessageBox.showException(exception);
				},
				scope: this
			}
		);
	},

	/**
	 * @private
	 */
	onPeriodFilterChange: function(startDate, dueDate, periodFilterComponent) {
		var view = this.getView();
		var gridView = view.getGrid();
		if (gridView.xtype === Terrasoft.Configuration.ActivityGridModeTypes.Schedule) {
			gridView.setPeriod({
				start: startDate,
				due: dueDate
			});
		}
		var period  = periodFilterComponent.getPeriod();
		if (!Ext.isEmpty(period)) {
			this.profileData.period = period;
		} else {
			this.profileData.period = {
				startDate: startDate,
				dueDate: dueDate
			};
		}
		this.saveActivityProfileData();
	},

	/**
	 * @private
	 */
	onScheduleCreateRecordWithValues: function(schedule, values) {
		if (this.tmpGridRecord) {
			return;
		}
		var model = this.self.Model;
		model.createWithDefaultValues(function(newRecord) {
			for (var column in values) {
				newRecord.set(column, values[column]);
			}
			var store = schedule.getStore();
			store.add(newRecord);
			schedule.select(newRecord);
			this.tmpGridRecord = newRecord;
			Terrasoft.util.openEditPage(model, {isCopy: true, newRecord: newRecord});
		}, function(scope, operation) {
			Terrasoft.MessageBox.showException(operation.getError());
			Terrasoft.Mask.hide();
		}, this);
	},

	/**
	 * @private
	 */
	onScheduleItemValueChange: function(record, columns) {
		var pageConroller = Terrasoft.PageNavigator.getLastPageController();
		if ("refreshDirtyDataByColumns" in pageConroller) {
			pageConroller.refreshDirtyDataByColumns(record, columns);
		}
	},

	/**
	 * @private
	 */
	onScheduleGridAreaTap: function() {
		while ((Terrasoft.PageNavigator.getLastPageController() !== this) &&
				Terrasoft.PageHistory.getAllItems().length !== 0) {
			Terrasoft.Router.back();
		}
	},

	/**
	 * @private
	 */
	onScheduleItemHold: function(item, record) {
		if (record.phantom) {
			return;
		}
		this.removeTmpGridRecord();
		var pageConroller = Terrasoft.PageNavigator.getLastPageController();
		if (pageConroller !== this) {
			this.openPreviewPage(record.getId());
		}
	},

	/**
	 * @private
	 */
	onScheduleTimeScaleChange: function(schedule, timeScale) {
		this.refreshDirtyData();
		this.profileData.scheduleTimeScale = timeScale;
		this.saveActivityProfileData();
	},

	/**
	 * @private
	 */
	onActionsButtonTap: function(element, event) {
		event.stopEvent();
		var actionsPicker =  this.getActionsPicker();
		if (!actionsPicker.getParent()) {
			Ext.Viewport.add(actionsPicker);
		}
		actionsPicker.show();
	},

	/**
	 * @private
	 */
	onOwnerButtonTap: function() {
		this.showEmployeePicker();
	},

	/**
	 * @private
	 */
	onItemTap: function(el, index, item, record) {
		var gridMode = this.getActivityGridMode();
		if (gridMode === Terrasoft.Configuration.ActivityGridModeTypes.List) {
			this.callParent(arguments);
		} else {
			this.removeTmpGridRecord();
			if (record.phantom) {
				return;
			}
			var recordId = record.getId();
			if ((this.selectedRecord && recordId === this.selectedRecord.getId()) ||
				Terrasoft.PageNavigator.getLastPageController() !== this) {
				this.openPreviewPage(recordId);
			}
			this.selectedRecord = record;
			this.showEditPanel(record);
		}
	},

	/**
	 * @private
	 */
	onScheduleDeselect: function() {
		this.selectedRecord = null;
		this.hideEditPanel();
	},

	/**
	 * @private
	 */
	onActivityStatusButtonTap: function() {
		var activityStatusRecord = this.getOppositeActivityStatusRecord(this.selectedRecord);
		this.saveCurrentActivityWithStatus(activityStatusRecord);
	},

	/**
	 * @private
	 */
	onActivityStatusPickerButtonTap: function() {
		var activityStatusPicker =  this.getActivityStatusPicker();
		if (!activityStatusPicker.getParent()) {
			Ext.Viewport.add(activityStatusPicker);
		}
		var activityStatusRecord = this.selectedRecord.get("Status");
		var activityStatusPickerList = activityStatusPicker.getComponent();
		var activityStatusStore = activityStatusPickerList.getStore();
		var statusRecord = activityStatusStore.getById(activityStatusRecord.getId());
		activityStatusPickerList.select(statusRecord, true, true);
		activityStatusPicker.show();
	},

	/**
	 * @private
	 */
	onActivityStatusPickerSelect: function(el, record) {
		this.saveCurrentActivityWithStatus(record);
	},

	/**
	 * @private
	 */
	onActionsPickerSelect: function(el, record) {
		var data = record.getData();
		var actionType = data.Type;
		var view = this.getView();
		var grid = view.getGrid();
		if (!(grid instanceof Ext.Component)) {
			return;
		}
		switch (actionType) {
			case "copyActionMenu":
				Terrasoft.MobileActivityActionsUtilities.doCopyActivityAction(this.selectedRecord, this.finishAction, this);
				this.deselectMenu(actionType);
				break;
			case "deleteActionMenu":
				Terrasoft.MobileActivityActionsUtilities.doDeleteActivityAction(this.selectedRecord, this.finishAction, this);
				this.deselectMenu(actionType);
				break;
			case "separateActionMenu":
				Terrasoft.MobileActivityActionsUtilities.doSeparateActivity(this.selectedRecord, this.finishAction, this);
				this.deselectMenu(actionType);
				break;
			case "refreshActionMenu":
				this.refreshDirtyData();
				this.deselectMenu(actionType);
				break;
			/*case "calculateEmployeeEfficiency":
			var actionEmployeeEfficiency = Ext.create('Terrasoft.Configuration.ActionEmployeeEfficiency');
			actionEmployeeEfficiency.execute({
			filters: this.getFilters()
			});
			this.deselectMenu(actionType);
			break;*/
			default:
				var gridMode = grid.xtype;
				if (gridMode !== actionType) {
					this.refreshDirtyData();
					this.deselectMenu(gridMode);
					this.changeGridMode(actionType);
				}
		}
	},

	/**
	 * @private
	 */
	deselectMenu: function(menuId) {
		var actionsPicker = this.actionsPicker;
		var pickerList = actionsPicker.getComponent();
		var pickerStore = pickerList.getStore();
		var selectedRecord = pickerStore.getById(menuId);
		pickerList.deselect(selectedRecord);
	},

	/**
	 * @private
	 */
	finishAction: function() {
		var view = this.getView();
		var grid = view.getGrid();
		grid.deselectAll();
		this.refreshDirtyData();
		Terrasoft.Mask.hide();
	},

	/**
	 * @private
	 */
	onEmployeePickerSelect: function(el, record) {
		this.changeOwner(record.getId());
	},

	/**
	 * @private
	 */
	onEmployeePickerFilterChange: function() {
		var employeePicker = this.employeePicker;
		var filterPanel = employeePicker.getFilterPanel();
		var filters = filterPanel.getFilters();
		var store = employeePicker.getComponent().getStore();
		store.loadPage(1, {
			filters: filters,
			scope: this
		});
	},

	/**
	 * @private
	 */
	onCurrentUserButtonTap: function() {
		this.employeePicker.hide();
		this.changeOwner(Terrasoft.CurrentUserInfo.contactId);
	},

	/**
	 * @private
	 */
	changeOwner: function(ownerId) {
		if (ownerId === this.profileData.ownerId) {
			return;
		}
		this.profileData.ownerId = ownerId;
		this.setOwnerButtonImage(ownerId);
		this.loadData();
		this.saveActivityProfileData();
	},

	/**
	 * @private
	 */
	showEmployeePicker: function() {
		var employeePicker =  this.getEmployeePicker();
		var employeeStore = employeePicker.getComponent().getStore();
		var ownerId = this.profileData.ownerId;
		var filters;
		if (ownerId !== Terrasoft.CurrentUserInfo.contactId) {
			filters = Ext.create("Terrasoft.Filter", {
				property: "Id",
				value: ownerId
			});
		}
		employeeStore.loadPage(1, {
			callback: function() {
				if (ownerId !== Terrasoft.CurrentUserInfo.contactId) {
					var list = employeePicker.getComponent();
					var employeeRecord = employeeStore.getById(ownerId);
					list.select(employeeRecord, false, true);
					var filterPanel = employeePicker.getFilterPanel();
					var searchModule = filterPanel.getModuleByName("LookupSearch");
					var name = employeeRecord.getPrimaryDisplayColumnValue();
					var searchModuleComponent = searchModule.getComponent();
					var searchField = searchModuleComponent.getComponent();
					searchField.setValue(name);
				}
				if (!employeePicker.getParent()) {
					Ext.Viewport.add(employeePicker);
				}
				employeePicker.show();
			},
			filters: filters,
			scope: this
		});
	},

	/**
	 * @private
	 */
	getEmployeeQueryConfig: function() {
		return Ext.create("Terrasoft.QueryConfig", {
			modelName: "Contact",
			columns: ["Name", "Photo.PreviewData"],
			orderByColumns: [{
				column: "Name",
				orderType: Terrasoft.OrderTypes.ASC
			}]
		});
	},

	/**
	 * @private
	 */
	getCurrentUserActionCaption: function() {
		return Ext.String.format(LocalizableStrings["ActivityGridPage_actionsPicker_CurrentUserFormat"],
			Terrasoft.CurrentUserInfo.contactName);
	},

	/**
	 * @private
	 */
	getActionsPickerStore: function() {
		var gridMode = this.getActivityGridMode();
		var gridModeGroupCaption = LocalizableStrings["ActivityGridPage_actionsPicker_GridModeGroup"];
		if (gridMode === Terrasoft.Configuration.ActivityGridModeTypes.Schedule) {
			var actionsGroupCaption = LocalizableStrings["ActivityGridPage_actionsPicker_ActionsGroup"];
			return Ext.create("Ext.data.Store", {
				model: "ActivityActionsModel",
				data: [
					{
						Type: "copyActionMenu",
						Name: LocalizableStrings["ActivityGridPage_actionsCopyButton_text"],
						Group: actionsGroupCaption
					},
					{
						Type: "deleteActionMenu",
						Name: LocalizableStrings["ActivityGridPage_actionsDeleteButton_text"],
						Group: actionsGroupCaption
					},
					{
						Type: "separateActionMenu",
						Name: LocalizableStrings["ActivityGridPage_actionsSeparateButton_text"],
						Group: actionsGroupCaption
					},
					{
						Type: "refreshActionMenu",
						Name: LocalizableStrings["ActivityGridPage_actionsRefreshButton_text"],
						Group: actionsGroupCaption
					},
					/*{
						Type: "calculateEmployeeEfficiency",
						Name: LocalizableStrings["ActivityGridPage_actionscalculateEmployeeEfficiencyButton_text"],
						Group: actionsGroupCaption
					},*/
					{
						Type: Terrasoft.Configuration.ActivityGridModeTypes.Schedule,
						Name: LocalizableStrings["ActivityGridPage_actionsPicker_Schedule"],
						Group: gridModeGroupCaption
					},
					{
						Type: Terrasoft.Configuration.ActivityGridModeTypes.List,
						Name: LocalizableStrings["ActivityGridPage_actionsPicker_List"],
						Group: gridModeGroupCaption
					}
				],
				grouper: "Group"
			});
		} else {
			return Ext.create("Ext.data.Store", {
				model: "ActivityActionsModel",
				data: [
					{
						Type: Terrasoft.Configuration.ActivityGridModeTypes.Schedule,
						Name: LocalizableStrings["ActivityGridPage_actionsPicker_Schedule"],
						Group: gridModeGroupCaption
					},
					{
						Type: Terrasoft.Configuration.ActivityGridModeTypes.List,
						Name: LocalizableStrings["ActivityGridPage_actionsPicker_List"],
						Group: gridModeGroupCaption
					}
				],
				grouper: "Group"
			});
		}
	},

	/**
	 * @private
	 */
	getActionsPicker: function() {
		if (this.actionsPicker) {
			var actionsPickerStore = this.getActionsPickerStore();
			var actionsPickerGrid = this.actionsPicker.getComponent();
			actionsPickerGrid.setStore(actionsPickerStore);
			return this.actionsPicker;
		}
		if (!Ext.ClassManager.get("ActivityActionsModel")) {
			Ext.define("ActivityActionsModel", {
				extend: "Ext.data.Model",
				config: {
					idProperty: "Type",
					fields: [
						{name: "Type"},
						{name: "Name", type: "string"},
						{name: "Data"},
						{name: "Group"}
					]
				}
			});
		}
		var pickerStore = this.getActionsPickerStore();
		this.actionsPicker = Ext.create("Ext.Terrasoft.SelectPicker", {
				component: {
					store: pickerStore,
					primaryColumn: "Name",
					listeners: {
						scope: this,
						select: this.onActionsPickerSelect
					},
					pinHeaders: false,
					mode: "MULTI",
					grouped: true,
					showGroupTitle: true
				},
				toolbar: {
					clearButton: false
				},
				deselectOnHide: false,
				popup: true
			}
		);
		var gridMode = this.getActivityGridMode();
		var selectedRecord = pickerStore.getById(gridMode);
		var pickerList = this.actionsPicker.getComponent();
		pickerList.select(selectedRecord);
		return this.actionsPicker;
	},

	/**
	 * @private
	 */
	getEmployeeStoreFilters: function() {
		var filters = Ext.create("Terrasoft.Filter", {
			modelName: "SysAdminUnit",
			assocProperty: "Contact",
			operation: "Terrasoft.FilterOperations.Any",
			property: "Active",
			value: true
		});
		return filters;
	},

	/**
	 * @private
	 */
	onBeforeEmployeeStoreLoad: function(store, operation) {
		Terrasoft.Mask.show();
		var filters = operation.getFilters();
		var employeeFilters = this.getEmployeeStoreFilters();
		if (filters) {
			var groupFilters = Ext.create("Terrasoft.Filter", {
				type: Terrasoft.FilterTypes.Group
			});
			groupFilters.addFilter(filters);
			groupFilters.addFilter(employeeFilters);
			filters = groupFilters;
		} else {
			filters = employeeFilters;
		}
		operation.setFilters(filters);
		operation.config.queryConfig = this.getEmployeeQueryConfig();
	},

	/**
	 * @private
	 */
	onEmployeeStoreLoad: function() {
		Terrasoft.Mask.hide();
	},

	/**
	 * @private
	 */
	getEmployeePicker: function() {
		if (this.employeePicker) {
			return this.employeePicker;
		}
		var employeeStore = Ext.create("Terrasoft.store.BaseStore", {
			model: "Contact"
		});
		employeeStore.on("beforeload", this.onBeforeEmployeeStoreLoad, this);
		employeeStore.on("load", this.onEmployeeStoreLoad, this);
		var view = this.getView();
		var defaultImageUrl = view.getDefaultOwnerImage();
		var employeePicker = this.employeePicker = Ext.create("Ext.Terrasoft.LookupPicker", {
			component: {
				store: employeeStore,
				primaryColumn: "Name",
				imageColumn: "Photo.PreviewData",
				defaultImage: defaultImageUrl,
				listeners: {
					scope: this,
					select: this.onEmployeePickerSelect
				}
			},
			toolbar: {
				clearButton: false
			},
			title: LocalizableStrings["ActivityGridPage_actionsPicker_OwnerGroup"],
			popup: true
		});
		var toolbar = employeePicker.getToolbar();
		var currentUserButton = Ext.create("Ext.Button", {
			text: LocalizableStrings["ActivityGridPage_actionsPicker_OwnerButton_text"],
			cls: "x-button-primary-blue",
			listeners: {
				tap: this.onCurrentUserButtonTap,
				scope: this
			}
		});
		toolbar.add(currentUserButton);
		var filterPanel = employeePicker.getFilterPanel();
		filterPanel.on("filterchange", this.onEmployeePickerFilterChange, this);
		filterPanel.addModule({
			xtype: Terrasoft.FilterModuleTypes.Search,
			filterColumnNames: ["Name"],
			name: "LookupSearch"
		});
		return employeePicker;
	},

	/**
	 * @private
	 */
	changeGridMode: function(mode) {
		var view = this.getView();
		view.setGrid({xtype: mode});
		this.loadData();
		this.profileData.gridMode = mode;
		view.updateCalendarPickerToolbar();
		this.saveActivityProfileData();
	},

	/**
	 * @private
	 */
	closeRecordPage: function() {
		while (Terrasoft.PageNavigator.getLastPageController() !== this)  {
			Terrasoft.Router.back();
		}
	},

	/**
	 * @private
	 */
	showEditPanel: function(record) {
		var view = this.getView();
		var filterPanel = view.getFilterPanel();
		filterPanel.hide();
		var editPanel = this.getEditPanel();
		var activityStatusButton = editPanel.getComponent("activityStatusButton");
		var text = this.getActivityStatusButtonText(record);
		activityStatusButton.setText(text);
		editPanel.show();
	},

	/**
	 * @private
	 */
	getActivityStatusButtonText: function(record) {
		var statusRecord = this.getOppositeActivityStatusRecord(record);
		var statusDisplayValue = statusRecord.getPrimaryDisplayColumnValue();
		return Ext.String.format(LocalizableStrings["ActivityGridPage_actionsPickerButton_Text"], statusDisplayValue);
	},

	/**
	 * @private
	 */
	getOppositeActivityStatusRecord: function(record) {
		var activityStatus = record.get("Status");
		var activityStatusData = ActivityStatus.Store.getData();
		if (activityStatus.getId() === Terrasoft.Configuration.ActivityStatus.Finished) {
			return activityStatusData.get(Terrasoft.Configuration.ActivityStatus.NotStarted);
		} else {
			return activityStatusData.get(Terrasoft.Configuration.ActivityStatus.Finished);
		}
	},

	/**
	 * @private
	 */
	hideEditPanel: function() {
		var editPanel = this.editPanel;
		if (!editPanel || editPanel.isHidden()) {
			return;
		}
		editPanel.hide();
		var view = this.getView();
		var filterPanel = view.getFilterPanel();
		filterPanel.show();
	},

	/**
	 * @private
	 */
	getEditPanel: function() {
		var view = this.getView();
		var wrappedContainer = view.getWrappedContainer();
		if (!this.editPanel) {
			var editPanel = this.editPanel = wrappedContainer.add(Ext.create("Ext.Container", {
				cls: "x-activity-grid-edit-panel",
				docked: "top",
				layout: "hbox"
			}));
			var activityStatusButton = Ext.create("Ext.Button", {
				itemId: "activityStatusButton",
				cls: ["x-button-primary-blue", "x-activity-grid-status-button"],
				flex: 1,
				listeners: {
					scope: this,
					tap: this.onActivityStatusButtonTap
				}
			});
			var activityStatusPickerButton = Ext.create("Ext.Button", {
				cls: ["x-button-primary-blue", "x-activity-grid-status-picker-button"],
				iconCls: "x-activity-grid-status-picker-button-icon",
				listeners: {
					scope: this,
					tap: this.onActivityStatusPickerButtonTap
				}
			});
			editPanel.add(activityStatusButton);
			editPanel.add(activityStatusPickerButton);
		}
		return this.editPanel;
	},

	/**
	 * @private
	 */
	getActivityStatusPicker: function() {
		if (this.activityStatusPicker) {
			return this.activityStatusPicker;
		}
		var pickerStore = ActivityStatus.Store;
		var pickerModel = pickerStore.getModel();
		this.activityStatusPicker = Ext.create("Ext.Terrasoft.SelectPicker", {
				component: {
					store: pickerStore,
					primaryColumn: pickerModel.PrimaryDisplayColumnName,
					listeners: {
						scope: this,
						select: this.onActivityStatusPickerSelect
					}
				},
				toolbar: {
					clearButton: false
				},
				deselectOnHide: true,
				title: LocalizableStrings["ActivityGridPage_activityTypePicker_title"],
				popup: true
			}
		);
		return this.activityStatusPicker;
	},

	/**
	 * @private
	 */
	saveCurrentActivityWithStatus: function(activityStatusRecord) {
		var selectedRecord = this.selectedRecord;
		if (selectedRecord) {
			selectedRecord.set("Status", activityStatusRecord);
			var queryConfig = Ext.create("Terrasoft.QueryConfig", {
				columns: ["Status"],
				modelName: "Activity"
			});
			Terrasoft.Mask.show();
			selectedRecord.save({
				queryConfig: queryConfig,
				success: function() {
					this.finishAction();
				},
				failure: function() {
					Terrasoft.Mask.hide();
				},
				scope: this
			}, this);
		}
	},

	/**
	 * @private
	 */
	getActivityGridMode: function() {
		var view = this.getView();
		var grid = view.getGrid();
		return grid.xtype;
	},

	/**
	 * @private
	 */
	removeTmpGridRecord: function() {
		if (this.tmpGridRecord) {
			var store = this.getView().getGrid().getStore();
			store.remove(this.tmpGridRecord);
			this.tmpGridRecord = null;
		}
	},

	/**
	 * @private
	 */
	isScheduleColumn: function(element) {
		if (!element) {
			return false;
		}
		var className = element.className;
		var parentNode = element.parentNode;
		return ((className === "x-time-column") || (className === "x-column")) && (parentNode.className !== "x-week-row");
	},

	/**
	 * @private
	 */
	changeDatePeriod: function(days) {
		var view = this.getView();
		var filterPanel = view.getFilterPanel();
		var periodFilter = filterPanel.getModuleByName("ActivityPeriodFilter");
		var periodFilterComponent = periodFilter.getComponent();
		var startDate = new Date(periodFilterComponent.getStartDate());
		startDate.setDate(startDate.getDate() + days);
		var dueDate = new Date(periodFilterComponent.getDueDate());
		dueDate.setDate(dueDate.getDate() + days);
		if (Terrasoft.util.compareDate(startDate, dueDate)) {
			var diff = Terrasoft.Date.diff(new Date(), startDate, Ext.Date.DAY) + 1;
			var period;
			switch (diff) {
				case 0:
					period = Terrasoft.CalendarPeriod.Today;
					break;
				case -1:
					period = Terrasoft.CalendarPeriod.Yesterday;
					break;
				case 1:
					period = Terrasoft.CalendarPeriod.Tomorrow;
					break;
			}
			if (!Ext.isEmpty(period)) {
				periodFilterComponent.setPeriod(period);
				return;
			}
		}
		periodFilterComponent.setDatePeriod(startDate, dueDate, false);
	},

	/**
	 * @private
	 */
	loadStore: function() {
		var gridView = this.getView().getGrid();
		if (!(gridView instanceof Ext.Component)) {
			return;
		}
		var store = gridView.getStore();
		if (gridView.xtype === "tsschedule") {
			store.setPageSize(-1);
		} else {
			store.setPageSize(Terrasoft.StorePageSize);
		}
		this.callParent(arguments);
	},

	/**
	 * @internal
	 * @virtual
	 */
	launch: function() {
		var view = this.getView();
		var gridConfig = view.getGrid();
		var isDetail = !!this.getPageHistoryItem().getDetailConfig();
		if (isDetail) {
			gridConfig.xtype = Terrasoft.Configuration.ActivityGridModeTypes.List;
			view.setGrid(gridConfig);
			this.callParent(arguments);
			return;
		}
		Terrasoft.Mask.show();
		this.loadActivityProfileData({
			success: this.onActivityProfileDataLoaded,
			failure: function(exception) {
				Terrasoft.MessageBox.showException(exception);
				Terrasoft.Mask.hide();
			},
			scope: this
		});
	},

	/**
	 * Метод вызывается после получения кода страницы, до получения данных (до launch()).
	 * @internal
	 * @virtual
	 */
	pageLoadComplete: function() {
		var gridMode = this.getActivityGridMode();
		if (gridMode !== Terrasoft.Configuration.ActivityGridModeTypes.Schedule) {
			this.callParent(arguments);
		}
		this.removeTmpGridRecord();
	},

	/**
	 * @protected
	 * @virtual
	 */
	initializeView: function(view) {
		view.initializedByController = true;
		this.callParent(arguments);
	},

	/**
	 * @protected
	 * @virtual
	 */
	initializeGrid: function(gridView) {
		this.callParent(arguments);
		var eventHandlers = {
			scope: this,
			gridareatap: this.onScheduleGridAreaTap,
			createrecordwithvalues: this.onScheduleCreateRecordWithValues,
			deselect: this.onScheduleDeselect,
			timescalechange: this.onScheduleTimeScaleChange
		};
		if (!Ext.os.is.Phone) {
			eventHandlers.itemvaluechange = this.onScheduleItemValueChange;
			eventHandlers.itemhold = this.onScheduleItemHold;
		}
		if (gridView instanceof Ext.Terrasoft.Schedule) {
			gridView.element.on({
				swipe: this.onWeekRowSwipe,
				delegate: ".x-week-row",
				scope: this
			});
			gridView.on(eventHandlers);
		} else {
			gridView.un(eventHandlers);
		}
	},

	/**
	 * @protected
	 * @virtual
	 */
	loadData: function() {
		this.hideEditPanel();
		var view = this.getView();
		var grid = view.getGrid();
		grid.deselectAll();
		this.callParent(arguments);
	},

	/**
	 * @protected
	 * @virtual
	 */
	getFilters: function() {
		var groupFilter = this.callParent(arguments);
		var gridMode = this.getActivityGridMode();
		if (gridMode === Terrasoft.Configuration.ActivityGridModeTypes.Schedule) {
			if (!groupFilter) {
				groupFilter = Ext.create("Terrasoft.Filter", {
					type: Terrasoft.FilterTypes.Group
				});
			}
			var filter = Ext.create("Terrasoft.Filter", {
				property: "ShowInScheduler",
				value: true
			});
			groupFilter.addFilter(filter);
		}
		var isDetail = !!this.getPageHistoryItem().getDetailConfig();
		if (!isDetail) {
			var ownerFilter = Ext.create("Terrasoft.Filter", {
				name: "ActivityByOwnerFilter",
				property: "Participant",
				modelName: "ActivityParticipant",
				assocProperty: "Activity",
				operation: Terrasoft.FilterOperations.Any,
				value: this.profileData.ownerId
			});
			groupFilter.addFilter(ownerFilter);
		}
		return groupFilter;
	},

	/**
	 * @protected
	 * @virtual
	 */
	onViewSwipeRight: function(event) {
		var target = event.target;
		var gridMode = this.getActivityGridMode();
		if ((gridMode !== Terrasoft.Configuration.ActivityGridModeTypes.Schedule) || this.isScheduleColumn(target)) {
			this.callParent(arguments);
		}
	},

	/**
	 * @protected
	 * @virtual
	 */
	onWeekRowSwipe: function(event) {
		var direction = event.direction;
		if (direction === "right") {
			this.changeDatePeriod(-1);
		} else if (direction === "left") {
			this.changeDatePeriod(1);
		}
	},

	/**
	 * @protected
	 * @virtual
	 */
	destroy: function() {
		this.callParent(arguments);
		Ext.destroy(this.actionsPicker);
		Ext.destroy(this.activityStatusPicker);
		Ext.destroy(this.employeePicker);
		this.employeePicker = null;
		this.activityStatusPicker = null;
		this.actionsPicker = null;
	}

});