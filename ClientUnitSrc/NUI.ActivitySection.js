define('ActivitySection', ['ext-base', 'terrasoft', 'sandbox', 'Activity',
	'ActivitySectionStructure', 'ActivitySectionResources', 'ProcessModule',
	'SectionViewGenerator', 'ActionUtilitiesModule', 'ConfigurationEnums',
	'ConfigurationConstants', 'EmailUtilities', 'BaseFiltersGenerateModule', 'MaskHelper'],
	function(Ext, Terrasoft, sandbox, Activity, structure, resources, processModule, SectionViewGenerator,
			actionUtilities, ConfigurationEnums, ConfigurationConstants, EmailUtilities,
			BaseFiltersGenerateModule, MaskHelper) {

			var gridButtonsHidden;
			function getActivityStatus(item) {
				var isFinished = item.get('Status.Finish');
				var dueDate = item.get('DueDate');
				if (dueDate <= new Date() && !isFinished) {
					return Terrasoft.ScheduleItemStatus.OVERDUE;
				} else if (isFinished) {
					return Terrasoft.ScheduleItemStatus.DONE;
				}
				return Terrasoft.ScheduleItemStatus.NEW;
			}

			function getContainerConfig(id, classes) {
				return {
					className: 'Terrasoft.Container',
					classes: {
						wrapClassName: classes
					},
					items: [],
					id: id,
					selectors: {
						wrapEl: '#' + id
					}
				};
			}

			function getSchedulerConfig() {
				var schedulerTimingStart = Terrasoft.SysSettings.cachedSettings.SchedulerTimingStart;
				var schedulerTimingEnd = Terrasoft.SysSettings.cachedSettings.SchedulerTimingEnd;
				var scheduleEdit = {
					className: 'Terrasoft.ScheduleEdit',
					startHour: 0,
					displayStartHour: ((!Ext.isEmpty(schedulerTimingStart) &&
						schedulerTimingStart > 0 && schedulerTimingStart < 24) ? schedulerTimingStart : 8) + '-00',
					dueHour: (!Ext.isEmpty(schedulerTimingEnd) && schedulerTimingEnd > 0 && schedulerTimingEnd < 24) ?
						schedulerTimingEnd : 24,
					timeScale: {
						bindTo: 'getTimeScale'
					},
					period: {
						bindTo: 'getSchedulerPeriod'
					},
					timezone: [
						{
							timezoneTitle: 'Kiev',
							timezoneTime: '+2'
						}
					],
					startDate: null,
					dueDate: null,
					activityCollection: {
						bindTo: 'gridData'
					},
					selectedItems: {
						bindTo: 'selectedRows'
					},
					scheduleItemDoubleClick: {
						bindTo: 'dblClickOpen'
					},
					change: {
						bindTo: 'changeScheduleItem'
					},
					itemBindingConfig: {
						itemId: {
							bindTo: 'Id'
						},
						title: {
							bindTo: 'Title'
						},
						dueDate: {
							bindTo: 'DueDate'
						},
						status: {
							bindTo: 'SchedulerStatus'
						},
						startDate: {
							bindTo: 'StartDate'
						},
						background: {
							bindTo: 'Background'
						},
						fontColor: {
							bindTo: 'FontColor'
						},
						isBold: {
							bindTo: 'IsBold'
						},
						isItalic: {
							bindTo: 'IsItalic'
						},
						isUnderline: {
							bindTo: 'IsUnderline'
						}
					}
				};
				return scheduleEdit;
			}

			function generateEditButtons() {
				var buttonsConfig = [SectionViewGenerator.getButtonAddConfig(Activity)];
				buttonsConfig.push({
					className: 'Terrasoft.Button',
					tag: ConfigurationEnums.CardState.View,
					enabled: {
						bindTo: 'getEditButtonsEnabled'
					},
					click: {
						bindTo: 'onSchedulerView'
					},
					styles: {
						textStyle: {
							margin: '0px 10px 0px 0px'
						}
					},
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: resources.localizableStrings.ViewButtonCaption

				});
				buttonsConfig.push({
					className: 'Terrasoft.Button',
					enabled: {
						bindTo: 'getEditButtonsEnabled'
					},
					click: {
						bindTo: 'onSchedulerEdit'
					},
					styles: {
						textStyle: {
							margin: '0px 10px 0px 0px'
						}
					},
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: resources.localizableStrings.EditButtonCaption,
					tag: ConfigurationEnums.CardState.Edit
				});
				buttonsConfig.push({
					className: 'Terrasoft.Button',
					enabled: {
						bindTo: 'getEditButtonsEnabled'
					},
					click: {
						bindTo: 'onSchedulerCopy'
					},
					styles: {
						textStyle: {
							margin: '0px 10px 0px 0px'
						}
					},
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: resources.localizableStrings.CopyButtonCaption,
					tag: ConfigurationEnums.CardState.Copy
				});
				buttonsConfig.push({
					className: 'Terrasoft.Button',
					tag: ConfigurationEnums.CardState.Delete,
					enabled: {
						bindTo: 'getEditButtonsEnabled'
					},
					click: {
						bindTo: 'onSchedulerDelete'
					},
					styles: {
						textStyle: {
							margin: '0px 10px 0px 0px'
						}
					},
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: resources.localizableStrings.DeleteButtonCaption

				});
				buttonsConfig.push({
					className: 'Terrasoft.Button',
					tag: ConfigurationEnums.CardState.Send,
					enabled: {
						bindTo: 'getEditButtonsEnabled'
					},
					visible: {
						bindTo: 'getSchedulerSendButtonsVisible'
					},
					click: {
						bindTo: 'onSchedulerSend'
					},
					styles: {
						textStyle: {
							margin: '0px 10px 0px 0px'
						}
					},
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: resources.localizableStrings.SendButtonCaption

				});
				return buttonsConfig;
			}

			structure.userCode = function() {
				this.entitySchema = Activity;
				this.contextHelpId = '1010';
				this.name = 'ActivitySectionViewModel';
				this.finishedTaskColor = null;
				this.configuration = {
					sort: {
						columns: [
							{
								name: 'StartDate',
								orderPosition: 1,
								orderDirection: Terrasoft.OrderDirection.DESC
							}
						]
					},
					pageNumber: 0,
					pageRowsCount: 10
				};
				this.columnsConfig = [
					[
						{
							cols: 24,
							key: [
								{
									name: {
										bindTo: 'Title'
									},
									type: 'title'
								}
							]
						}
					],
					[
						{
							cols: 6,
							key: [
								{
									name: {
										bindTo: 'Owner'
									}
								}
							]
						},
						{
							cols: 3,
							key: [
								{
									name: {
										bindTo: 'StartDate'
									}
								}
							]
						},
						{
							cols: 4,
							key: [
								{
									name: {
										bindTo: 'Result'
									}
								}
							]
						},
						{
							cols: 11,
							key: [
								{
									name: {
										bindTo: 'DetailedResult'
									}
								}
							]
						}
					]
				];
				this.loadedColumns = [
					{
						columnPath: 'Type'
					},
					{
						columnPath: 'Title'
					},
					{
						columnPath: 'StartDate'
					},
					{
						columnPath: 'DueDate'
					},
					{
						columnPath: 'Owner'
					},
					{
						columnPath: 'Result'
					},
					{
						columnPath: 'DetailedResult'
					},
					{
						columnPath: 'ProcessElementId'
					},
					{
						columnPath: 'Status'
					},
					{
						columnPath: 'Status.Finish'
					},
					{
						columnPath: 'EmailSendStatus'
					},
					{
						columnPath: 'Sender'
					},
					{
						columnPath: 'Recepient'
					},
					{
						columnPath: 'CopyRecepient'
					},
					{
						columnPath: 'BlindCopyRecepient'
					},
					{
						columnPath: 'MessageType'
					},
					{
						columnPath: 'ShowInScheduler'
					}
				];

				this.methods.createActions = function() {
					if (Terrasoft.SysSettings.cachedSettings.BuildType !== 'e45eb864-59cc-4325-8276-d85e1ba90c95') {
						return [
							{
								caption: '',
								className: 'Terrasoft.MenuSeparator'
							},
							{
								caption: resources.localizableStrings.SynchronizeWithGoogleCalendarAction,
								methodName: "synchronizeWithGoogleCalendar"
							},
							{
								caption: resources.localizableStrings.OpenGoogleSettingsPage,
								methodName: "openGoogleSettingsPage"
							},
							{
								caption: resources.localizableStrings.LoadImapEmailsAction,
								methodName: 'loadEmails'
							}
						];
					}
					return [];
				};
				this.actions = this.methods.createActions();

				this.methods.changeScheduleItem = function(recordId) {
					var gridData = this.get('gridData');
					var activity = gridData.get(recordId);
					if (!Ext.isEmpty(activity)) {
						activity.saveEntity(function(result) {});
					}
				};
				this.methods.openGoogleSettingsPage = function() {
					sandbox.publish('PushHistoryState', { hash: 'GoogleIntegrationSettingsModule/',
						stateObj: { schema: 'Activity' } });
				};

				this.methods.onSchedulerSend = function() {
					var selectedRows = this.get('selectedRows');
					var gridData = this.get('gridData');
					if (selectedRows) {
						Terrasoft.each(selectedRows, function(itemId) {
							var activeRow = gridData.get(itemId);
							this.sendEmail(activeRow);
						}, this);
					}
				};

				this.methods.sendEmail = function(activeRow) {
					if (!Ext.isEmpty(activeRow)) {
						var type = activeRow.get('Type');
						if (type.value === ConfigurationConstants.Activity.Type.Email) {
							var sender = activeRow.get('Sender');
							var recepient = activeRow.get('Recepient');
							var copyRecepient = activeRow.get('CopyRecepient');
							var blindCopyRecepient = activeRow.get('BlindCopyRecepient');
							var status = activeRow.get('EmailSendStatus');
							if (!Ext.isEmpty(status) &&
								status.value === ConfigurationConstants.Activity.EmailSendStatus.Sended) {
								this.showConfirmationDialog(resources.localizableStrings.EmailWasSent);
							} else if (Ext.isEmpty(sender)) {
								this.showConfirmationDialog(resources.localizableStrings.SendEmailForUserQuestion);
							} else if (Ext.isEmpty(recepient) &&
								Ext.isEmpty(copyRecepient) &&
								Ext.isEmpty(blindCopyRecepient)) {
								this.showConfirmationDialog(resources.localizableStrings.RecepientEmailForUserQuestion);
							} else {
								var activeRowId = activeRow.get('Id');
								EmailUtilities.send(activeRowId, this);
							}
						} else {
							this.showConfirmationDialog(resources.localizableStrings.ThisNotEmail);
						}
					}
				};
				this.methods.onActiveRowAction = function(tag, id, parentOnActiveRowAction) {
					switch (tag) {
						case ConfigurationEnums.CardState.Send:
							var gridData = this.get('gridData');
							var activeRowId = this.get('activeRow');
							var activeRow = gridData.get(activeRowId);
							this.sendEmail(activeRow);
							break;
						case ConfigurationEnums.CardState.Reply:
							var gridDataReply = this.get('gridData');
							var activeRowReplyId = this.get('activeRow');
							var activeRowReply = gridDataReply.get(activeRowReplyId);
							sandbox.publish('PushHistoryState', { hash: activeRowReply.replyLink });
							break;
						case ConfigurationEnums.CardState.ReplyAll:
							var gridDataReplyAll = this.get('gridData');
							var activeRowReplyAllId = this.get('activeRow');
							var activeRowReplyAll = gridDataReplyAll.get(activeRowReplyAllId);
							sandbox.publish('PushHistoryState', { hash: activeRowReplyAll.replyAllLink });
							break;
						case ConfigurationEnums.CardState.Forward:
							var gridDataForward = this.get('gridData');
							var activeRowForwardId = this.get('activeRow');
							var activeRowForward = gridDataForward.get(activeRowForwardId);
							sandbox.publish('PushHistoryState', { hash: activeRowForward.forwardLink });
							break;
						default:
							parentOnActiveRowAction.call(this, tag, id);
							break;
					}
				};
				var dblClickOpenMethod = function(hashObject) {
					sandbox.publish('PushHistoryState', hashObject);
				};
				this.methods.dblClickOpen = function(item) {
					var gridData = this.get('gridData');
					var activeRow = gridData.get(item);
					var recordId = activeRow.get('Id');
					var procElId = activeRow.get('ProcessElementId');
					var hashObject = { hash: activeRow.editLink };
					if (procElId && !Terrasoft.isEmptyGUID(procElId)) {
						publishProcessExecDataChanged(procElId, recordId, this, hashObject, dblClickOpenMethod);
					} else {
						dblClickOpenMethod.call(this, hashObject);
					}
				};

				this.methods.getLink = function(item, typeLink, scope) {
					var link = Terrasoft.workspaceBaseUrl;
					var emailId = item.get('Id');
					var emailSchemaName = 'Activity';
					var emailConfig = Terrasoft.configuration.ModuleStructure[emailSchemaName];
					var typeId = item.get(emailConfig.attribute);
					var URL = '';
					var cardSchema = emailConfig.cardSchema;
					Terrasoft.each(emailConfig.pages, function(item) {
						if (item.UId === typeId.value && item.cardSchema) {
							cardSchema = item.cardSchema;
						}
					}, this);
					if (typeLink === 'linkEdit') {
						URL = [emailConfig.cardModule, cardSchema, ConfigurationEnums.CardState.Edit, emailId];
					} else if (typeLink === 'linkReply') {
						URL = [emailConfig.cardModule, cardSchema, ConfigurationEnums.CardState.Add,
							emailConfig.attribute, typeId.value, 'Reply', emailId];
					} else if (typeLink === 'linkReplyAll') {
						URL = [emailConfig.cardModule, cardSchema, ConfigurationEnums.CardState.Add,
							emailConfig.attribute, typeId.value, 'ReplyAll', emailId];
					} else if (typeLink === 'linkForward') {
						URL = [emailConfig.cardModule, cardSchema, ConfigurationEnums.CardState.Add,
							emailConfig.attribute, typeId.value, 'Forward', emailId];
					}
					return URL.join('/');
				};
				this.methods.edit = function(tag, recordId, parentMethodEdit) {
					var procElId;
					var changedRecordId;
					var viewModel = this;
					Terrasoft.each(this.changedValues.gridData.getItems(), function(item) {
						if (viewModel.changedValues.activeRow === item.get(viewModel.primaryColumnName)) {
							procElId = item.get('ProcessElementId');
							changedRecordId = item.get('Id');
						}
					});
					if (procElId && !Terrasoft.isEmptyGUID(procElId)) {
						publishProcessExecDataChanged(procElId, recordId, this, tag, parentMethodEdit);
					} else if (parentMethodEdit) {
						parentMethodEdit.call(this, tag);
					}
				};
				this.methods.getSchedulerPeriod = function() {
					var startDate = this.get('SchedulerStartDate');
					var dueDate = this.get('SchedulerDueDate');
					var clearDueDate = Ext.Date.clearTime(dueDate);
					var clearStartDate = Ext.Date.clearTime(startDate);
					var daysMerge = clearDueDate - clearStartDate;
					if (daysMerge < 0) {
						startDate = dueDate;
					}
					return {
						startDate: startDate,
						dueDate: dueDate
					};
				};
				this.methods.getTimeScale = function() {
					return this.get('SchedulerTimeScaleLookupValue').value;
				};
				function publishProcessExecDataChanged(procElId, recordId, scope, parentMethodArguments,
						parentMethod) {
					sandbox.publish('ProcessExecDataChanged',
						{
							procElUId: procElId,
							recordId: recordId,
							scope: scope,
							parentMethodArguments: parentMethodArguments,
							parentMethod: parentMethod
						});
				}

				function prepareEdit(scope) {
					var selectedValues = scope.get('selectedRows');
					if (selectedValues && selectedValues.length > 0) {
						scope.set('activeRow', selectedValues[0]);
					}
					var attribute = Terrasoft.configuration.ModuleStructure[Activity.name].attribute;
					if (!Ext.isEmpty(attribute)) {
						var gridDataCollection = scope.get('gridData');
						var activeRowId = scope.get('activeRow');
						var attributeColumn = null;
						gridDataCollection.each(function(item) {
							if (item.get(item.primaryColumnName) === activeRowId) {
								attributeColumn = item.get(attribute);
							}
						}, this);
						if (!Ext.isEmpty(attributeColumn)) {
							var UId = attributeColumn.value;
							var pages = Terrasoft.configuration.ModuleStructure[Activity.name].pages;
							var editPage = null;
							Terrasoft.each(pages, function(item) {
								if (item.UId === UId && Ext.isEmpty(editPage)) {
									editPage = item;
								}
							});
							if (!Ext.isEmpty(editPage)) {
								return editPage;
							}
						}
					}
					return {};
				}

				this.methods.esqConfig = {
					sort: {
						columns: [
							{
								name: 'StartDate',
								orderPosition: 0,
								orderDirection: Terrasoft.OrderDirection.ASC
							}
						]
					}
				};
				this.methods.getEditButtonsEnabled = function() {
					var selectedValues = this.get('selectedRows');
					return selectedValues && selectedValues.length > 0;
				};
				this.methods.getSchedulerSendButtonsVisible = function() {
					var selectedRows = this.get('selectedRows');
					var gridData = this.get('gridData');
					var visible = false;
					if (selectedRows) {
						Terrasoft.each(selectedRows, function(itemId) {
							if (!gridData.contains(itemId)) {
								return;
							}
							var activeRow = gridData.get(itemId);
							var type = activeRow.get('Type');
							if (type.value === ConfigurationConstants.Activity.Type.Email) {
								visible = true;
							}
						}, this);
					}
					return visible;
				};
				this.methods.onSchedulerView = function() {
					var tag = prepareEdit(this);
					var recordId = this.get('activeRow');
					this.view(tag, recordId);
				};
				this.methods.onSchedulerEdit = function() {
					var tag = prepareEdit(this);
					var recordId = this.get('activeRow');
					this.edit(tag, recordId);
				};
				this.methods.onSchedulerCopy = function() {
					var tag = prepareEdit(this);
					var recordId = this.get('activeRow');
					this.copy(tag, recordId);
				};
				this.methods.onSchedulerDelete = function() {
					prepareEdit(this);
					this.onDelete();
				};
				this.methods.getSendButtonsEnabled = function() {
					var selectedValues = this.get('selectedRows');
					return selectedValues && selectedValues.length > 0;
				};
				this.methods.modifyGridConfig = function(gridConfig) {
					var buttonSendConfig = {
						className: 'Terrasoft.Button',
						tag: ConfigurationEnums.CardState.Send,
						visible: {
							bindTo: 'getSendButtonsVisible'
						},
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.SendButtonCaption
					};
					var buttonReplyConfig = {
						className: 'Terrasoft.Button',
						tag: ConfigurationEnums.CardState.Reply,
						visible: {
							bindTo: 'getReplyButtonsVisible'
						},
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.ReplyButtonCaption
					};
					var buttonReplyAllConfig = {
						className: 'Terrasoft.Button',
						tag: ConfigurationEnums.CardState.ReplyAll,
						visible: {
							bindTo: 'getReplyButtonsVisible'
						},
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.ReplyAllButtonCaption
					};
					var buttonForwardConfig = {
						className: 'Terrasoft.Button',
						tag: ConfigurationEnums.CardState.Forward,
						visible: {
							bindTo: 'getForwardButtonsVisible'
						},
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.ForwardButtonCaption
					};
					var gConfig = gridConfig;
					var activeRowActions = [];
					var deleteItem;
					Terrasoft.each(gConfig.activeRowActions, function(item) {
						if (item.tag === 'delete') {
							deleteItem = item;
						} else {
							activeRowActions.push(item);
						}
					}, this);
					gConfig.activeRowActions = activeRowActions;
					if (gridButtonsHidden === undefined || !gridButtonsHidden) {
						gConfig.activeRowActions.push(buttonSendConfig);
						gConfig.activeRowActions.push(buttonReplyConfig);
						gConfig.activeRowActions.push(buttonReplyAllConfig);
						gConfig.activeRowActions.push(buttonForwardConfig);
						gConfig.activeRowActions.push(deleteItem);
					}
					return gConfig;
				};
				this.methods.view = function(tag, recordId) {
					var baseMethod = arguments[arguments.length - 1];
					baseMethod.call(this, tag, recordId);
					//this.view();
				};
				this.methods.createViewConfig = function(viewsConfigName) {
					if ('scheduler') {
						var actionsCongif = getContainerConfig('SectionActionsContainer');
						//SectionViewGenerator.getActionsCongif(this.getSchedulerActions());
						var utilsConfig = getContainerConfig('schedulerUtils');
						var summaryPanel = getContainerConfig('summary-container');
						var buttonsPanel = getContainerConfig('button-panel');
						buttonsPanel.items = generateEditButtons();
						var actions = this.createActions();
						actionUtilities.addActionsButton(buttonsPanel.items, actions);
						utilsConfig.items = [buttonsPanel];
						utilsConfig.items.push(summaryPanel);
						utilsConfig.items.push(actionsCongif);
						var viewConfig = getContainerConfig('schedulerAutoGeneratedContainer');
						viewConfig.items = [utilsConfig, getSchedulerConfig()];
						return viewConfig;
					}
					return null;
				};
				this.methods.getCurrentViewActions = function(baseGetCurrentViewActions) {
					var currentTabName = this.get('currentTabName');
					if (currentTabName === 'scheduler') {
						return this.getSchedulerActions();
					}
					return baseGetCurrentViewActions.call(this);
				};
				function getMailboxSyncSettings() {
					this.set('isMailboxSyncEnabled', false);
					this.set('isMailboxSyncExist', false);
					var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
						rootSchemaName: 'MailboxSyncSettings'
					});
					esq.addColumn('Id');
					var filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						'SysAdminUnit', Terrasoft.SysValue.CURRENT_USER.value);
					esq.filters.addItem(filter);
					esq.getEntityCollection(function(response) {
						if (response.success) {
							this.set('isMailboxSyncEnabled', true);
							this.set('isMailboxSyncExist', (response.collection.getItems().length > 0));
						}
					}, this);
				}
				this.methods.initViewModel = function() {
					this.set('SchedulerTimeScaleLookupValue', {
						value: Terrasoft.TimeScale.THIRTY_MINUTES
					});
					this.set('SchedulerSelectedItems', []);
					getMailboxSyncSettings.call(this);
				};
				this.methods.getDefView = function() {
					var activeView = this.getCustomProfileValue('activeView');
					if (!Ext.isEmpty(activeView)) {
						return activeView;
					}
					return 'scheduler';
				};
				this.methods.getViews = function(baseGetViews) {
					var views = baseGetViews.call(this);
					views.unshift({
						name: 'scheduler',
						caption: resources.localizableStrings.SchedulerHeader
					});
					return views;
				};
				this.methods.getSchedulerActions = function() {
					var intervals = [];
					for (var intervalName in Terrasoft.TimeScale) {
						var itnerval = Terrasoft.TimeScale[intervalName];
						intervals.push({
							caption: resources.localizableStrings.IntervalFormat.replace('#interval#', itnerval),
							tag: itnerval,
							click: {
								bindTo: 'changeInterval'
							}
						});

					}
					return intervals;
				};
				this.methods.changeInterval = function(tag) {
					this.set('SchedulerTimeScaleLookupValue', {
						value: tag
					});
				};
				this.methods.add = function(tag, parentAdd) {
					if (this.get('currentTabName') === 'scheduler') {
						tag.additionalValues = [
							{ name: 'ShowInScheduler', value: true }
						];
					}
					parentAdd.call(this, tag);
				};
				this.methods.load = function(tabName, event) {
					var parentLoad = arguments[arguments.length - 1];
					var filters = this.publishMessage('GetFixedFilter', 'PeriodFilter');
					if (!filters || !filters.startDate || !filters.dueDate) {
						filters = {
							startDate: new Date(),
							dueDate: new Date()
						};
					}

					this.set('SchedulerStartDate', filters.startDate);
					this.set('SchedulerDueDate', filters.dueDate);
					parentLoad.call(this, tabName, event);
				};
				this.methods.viewChanging = function(viewName) {
					if (!this.get('SchedulerStartDate')) {
						this.set('SchedulerStartDate', new Date());
					}
					if (!this.get('SchedulerDueDate')) {
						this.set('SchedulerDueDate', new Date());
					}
					this.loadAll = viewName === 'scheduler';
					this.setCustomProfile('activeView', viewName === 'mainView' ? viewName : '');
				};
				function generateViewModelColumn(schemaItem) {
					return {
						type: schemaItem.columnType ? schemaItem.columnType :
							Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
						caption: schemaItem.caption,
						name: schemaItem.name,
						columnPath: schemaItem.columnPath
					};
				}

				this.methods.onLoadData = function(response) {
					//var responseCollection = response.collection.getItems();
					var responseCollection = response.collection;
					var finishedTaskColor = this.finishedTaskColor;
					var expiredTaskColor = this.expiredTaskColor;
					if (responseCollection) {
						if (this.get('currentTabName') === 'scheduler') {
							responseCollection.each(function(item) {
								if (!item.get('ShowInScheduler')) {
									this.remove(item);
								}
							}, responseCollection);
						}
					}
					return response;
				};

				this.fixedFilterConfig = {
					entitySchema: Activity,
					filters: [
						{
							name: 'PeriodFilter',
							caption: resources.localizableStrings.PeriodFilterCaption,
							dataValueType: Terrasoft.DataValueType.DATE,
							startDate: {
								columnName: 'StartDate',
								defValue: Terrasoft.startOfWeek(new Date())
							},
							dueDate: {
								columnName: 'DueDate',
								defValue: Terrasoft.endOfWeek(new Date())
							}
						},
						{
							name: 'Owner',
							caption: resources.localizableStrings.OwnerFilterCaption,
							columnName: 'Owner',
							defValue: Terrasoft.SysValue.CURRENT_USER_CONTACT,
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							filter: BaseFiltersGenerateModule.OwnerFilter,
							appendFilter: function(filterInfo) {
								var filter;
								if (filterInfo.value && filterInfo.value.length > 0) {
									filter = Terrasoft.createColumnInFilterWithParameters(
										'[ActivityParticipant:Activity].Participant',
										filterInfo.value);
								}
								return filter;
							}
						}
					]
				};
				this.methods.modifyItems = function(responseCollection) {
					responseCollection.each(function(item) {
						var columns = item.columns;
						Terrasoft.each(columns, function(column) {
							column.type = Terrasoft.ViewModelColumnType.ENTITY_COLUMN;
						}, this);
						item.set('SchedulerStatus', getActivityStatus(item));
						item.editLink = this.getLink(item, 'linkEdit', this);
						item.replyLink = this.getLink(item, 'linkReply', this);
						item.replyAllLink = this.getLink(item, 'linkReplyAll', this);
						item.forwardLink = this.getLink(item, 'linkForward', this);

						item.getForwardButtonsVisible = function() {
							var visible = false;
							var type = this.get('Type');
							var emailSendStatus = this.get('EmailSendStatus');
							if (type.value === ConfigurationConstants.Activity.Type.Email &&
								emailSendStatus.value === ConfigurationConstants.Activity.EmailSendStatus.Sended) {
								visible = true;
							}
							return visible;
						};

						item.getSendButtonsVisible = function() {
							var visible = false;
							var type = this.get('Type');
							var emailSendStatus = this.get('EmailSendStatus');
							if (type.value === ConfigurationConstants.Activity.Type.Email &&
								emailSendStatus.value !== ConfigurationConstants.Activity.EmailSendStatus.Sended) {
								visible = true;
							}
							return visible;
						};

						item.getReplyButtonsVisible = function() {
							var enabled = false;
							var type = this.get('Type');
							var emailType = this.get('MessageType');
							if (type.value === ConfigurationConstants.Activity.Type.Email &&
								emailType.value === ConfigurationConstants.Activity.MessageType.Incoming) {
								enabled = true;
							}
							return enabled;
						};
					}, this);
				};
				this.methods.synchronizeWithGoogleCalendar = function() {
					MaskHelper.ShowBodyMask();
					var requestUrl = Terrasoft.workspaceBaseUrl +
						'/ServiceModel/ProcessEngineService.svc/SynchronizeCalendarWithGoogleModuleProcess/' +
						'Execute?ResultParameterName=SyncResult';
					var viewModel = this;
					Ext.Ajax.request({
						url: requestUrl,
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						method: 'POST',
						scope: this,
						callback: function(request, success, response) {
							var messageFail;
							if (success) {
								var responseValue = Ext.isIE8 || Ext.isIE9 ?
									response.responseXML.firstChild.text :
									response.responseXML.firstChild.textContent;
								var responseData = Ext.decode(Ext.decode(responseValue));
								if (Ext.isEmpty(responseData)) {
									messageFail = resources.localizableStrings.SyncProcessFail;
								} else if (responseData.addedRecordsInBPMonlineCount) {
									viewModel.clear();
									viewModel.load();
									var message = Ext.String.format(
										resources.localizableStrings.SynchronizeWithGoogleSyncResult,
										responseData.addedRecordsInBPMonlineCount,
										responseData.updatedRecordsInBPMonlineCount,
										responseData.deletedRecordsInBPMonlineCount,
										responseData.addedRecordsInGoogleCount,
										responseData.updatedRecordsInGoogleCount,
										responseData.deletedRecordsInGoogleCount);
									Terrasoft.utils.showInformation(message, null, null, {buttons: ['ok']});
								} else if (responseData.settingsNotSet) {
									messageFail = resources.localizableStrings.SettingsNotSet;
								} else {
									messageFail = resources.localizableStrings.SyncProcessFail;
									if (Ext.isString(responseData)) {
										messageFail = messageFail + ': \r\n' + responseData;
									}
								}
							} else {
								messageFail = resources.localizableStrings.CallbackFailed;
							}
							MaskHelper.HideBodyMask();
							if (messageFail) {
								Terrasoft.utils.showInformation(messageFail, null, null, {buttons: ['ok']});
							}
						}
					});
				};
				this.methods.applySectionConfig = function(sectionInfo) {
					if (sectionInfo !== undefined && sectionInfo !== null && sectionInfo.isHomePage) {
						gridButtonsHidden = true;
					}
				};
				this.methods.loadImapEmails = function() {
					window.console.warn(Ext.String.format(Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
						'loadImapEmails', 'loadEmails'));
					this.loadEmails();
				};
				this.methods.loadEmails = function() {
					if (!this.get('isMailboxSyncExist')) {
						var buttonsConfig = {
							buttons: [Terrasoft.MessageBoxButtons.OK.returnCode],
							defaultButton: 0
						};
						Terrasoft.showInformation(resources.localizableStrings.MailboxSettingsEmpty,
							function() {}, this, buttonsConfig);
						return;
					}
					var select = Ext.create('Terrasoft.EntitySchemaQuery', {
						rootSchemaName: 'ActivityFolder'
					});
					select.addColumn('Id');
					select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						'[MailboxSyncSettings:MailboxName:Name].SysAdminUnit', Terrasoft.SysValue.CURRENT_USER.value));
					select.getEntityCollection(function(response) {
						if (response.success) {
							Terrasoft.each(response.collection.getItems(), function(item) {
								var requestUrl = Terrasoft.workspaceBaseUrl +
									'/ServiceModel/ProcessEngineService.svc/LoadImapEmailsProcess/' +
									'Execute?ResultParameterName=LoadResult' +
									'&MailBoxFolderId=' + item.get('Id');
								MaskHelper.ShowBodyMask();
								Ext.Ajax.request({
									url: requestUrl,
									headers: {
										'Content-Type': 'application/json',
										'Accept': 'application/json'
									},
									method: 'POST',
									scope: this,
									callback: function(request, success, response) {
										MaskHelper.HideBodyMask();
										var responseData;
										if (success) {
											var responseValue = Ext.isIE8 || Ext.isIE9 ?
												response.responseXML.firstChild.text :
												response.responseXML.firstChild.textContent;
											responseData = Ext.decode(Ext.decode(responseValue));
											this.clear();
											this.load();
											Terrasoft.utils.showInformation(
												resources.localizableStrings.LoadImapEmailsResult, null, null,
												{ buttons: ['ok'] });
										}
										if (responseData.Messages.length > 0) {
											Terrasoft.each(responseData.Messages, function(element, index, list) {
												Terrasoft.utils.showInformation(element.message, null, null,
													{ buttons: ['ok'] });
											}, this);
										}
									}
								});
							}, this);
						}
					}, this);
				};

			};
			return structure;
		});
