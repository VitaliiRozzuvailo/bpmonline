define("MailboxSynchronizationSettingsModule", ["sandbox", "ext-base", "terrasoft",
		"MailboxSynchronizationSettingsModuleResources", "ServiceHelper", "MailboxSyncSettings", "RightUtilities",
		"MaskHelper"],
	function(sandbox, Ext, Terrasoft, resources, ServiceHelper, MailboxSyncSettings, RightUtilities, MaskHelper) {
		var viewModel = null;
		var viewConfig;

		function getView() {
			if (!viewConfig) {
				viewConfig = {
					id: "main",
					markerValue: resources.localizableStrings.WindowCaptionEx,
					selectors: {
						wrapEl: "#main"
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "topButtons",
							selectors: {
								wrapEl: "#topButtons"
							},
							classes: {
								wrapClassName: ["container-spacing"]
							},
							items: [
								{
									className: "Terrasoft.Button",
									style: Terrasoft.controls.ButtonEnums.style.GREEN,
									caption: resources.localizableStrings.AddButtonCaptionEx,
									click: {
										bindTo: "onAddButtonClick"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "consumerSecretEdit",
							selectors: {
								wrapEl: "#consumerSecretEdit"
							},
							classes: {
								wrapClassName: ["container-spacing"]
							},
							items: [
								{
									className: "Terrasoft.Grid",
									type: "listed",
									primaryColumnName: "Id",
									primaryDisplayColumnName: "UserName",
									activeRow: {
										bindTo: "activeRowId"
									},
									columnsConfig: [
										{
											cols: 8,
											key: [
												{
													name: {
														bindTo: "UserName"
													},
													type: "title"
												}
											]
										},
										{
											cols: 8,
											key: [
												{
													name: {
														bindTo: "Type"
													}
												}
											]
										},
										{
											cols: 8,
											key: [
												{
													name: {
														bindTo: "MailBoxOwner"
													}
												}
											]
										}
									],
									captionsConfig: [
										{
											cols: 8,
											name: resources.localizableStrings.UserNameGridCaption
										},
										{
											cols: 8,
											name: resources.localizableStrings.TypeGridCaption
										},
										{
											cols: 8,
											name: resources.localizableStrings.MailBoxOwnerCaption
										}
									],
									collection: {
										bindTo: "mailboxGridData"
									},
									activeRowAction: {
										bindTo: "onActiveRowSelect"
									},
									activeRowActions: [
										{
											className: "Terrasoft.Button",
											style: Terrasoft.controls.ButtonEnums.style.BLUE,
											caption: resources.localizableStrings.EditButtonCaptionEx,
											markerValue: resources.localizableStrings.EditButtonCaptionEx,
											tag: "Edit",
											visible: {
												bindTo: "isSchemaCanEditRight"
											}
										},
										{
											className: "Terrasoft.Button",
											style: Terrasoft.controls.ButtonEnums.style.GREY,
											caption: resources.localizableStrings.DeleteButtonCaptionEx,
											markerValue: resources.localizableStrings.DeleteButtonCaptionEx,
											tag: "Delete",
											visible: {
												"bindTo": "isSchemaCanDeleteRight"
											}
										},
										{
											className: "Terrasoft.Button",
											style: Terrasoft.controls.ButtonEnums.style.GREY,
											caption: resources.localizableStrings.EditRightsButtonCaption,
											markerValue: resources.localizableStrings.EditRightsButtonCaption,
											tag: "EditRights"
										}
									],
									watchedRowInViewport: {
										bindTo: "loadNext"
									}
								}
							]
						}
					]
				};
			}
			return Ext.create("Terrasoft.Container", Terrasoft.deepClone(viewConfig));
		}

		function getViewModel() {
			return Ext.create("Terrasoft.BaseViewModel", {
				values: {
					activeRowId: null,
					mailboxGridData: Ext.create("Terrasoft.BaseViewModelCollection")
				},
				methods: {
					getData: function() {
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "MailboxSyncSettings"
						});
						select.addColumn("Id", "Id");
						select.addColumn("UserName", "UserName");
						select.addColumn("MailServer.Type", "Type");
						select.addColumn("SysAdminUnit.Contact.Name", "MailBoxOwner");
						var filterGroup = select.createFilterGroup();
						filterGroup.Name = "FilterGroup";
						filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
						var filterSysAdminUnit = select.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "SysAdminUnit", Terrasoft.SysValue.CURRENT_USER.value);
						filterGroup.add("filterSysAdminUnit", filterSysAdminUnit);
						var isSharedFilter = select.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "IsShared", true);
						filterGroup.add("IsSharedFilter", isSharedFilter);
						select.filters.add(filterGroup);
						select.getEntityCollection(function(result) {
							MaskHelper.HideBodyMask();
							if (result.success) {
								this.loadModel(result, this.getSchemaRecordRights, this);
							}
						}, this);
					},

					/**
					 * Устанавливает значение права доступа на операцию.
					 * @param records Коллекция идентификаторов почтовых ящиков.
					 * @param scope
					 */
					getSchemaRecordRights : function(records, scope) {
						records.forEach(function(recordId) {
							RightUtilities.getSchemaRecordRightLevel("MailboxSyncSettings", recordId,
								function(rightLevel) {
									var canEdit = this.canEdit(rightLevel);
									var canDelete = this.canDelete(rightLevel);
									var gridData = scope.get("mailboxGridData");
									var record = gridData.get(recordId);
									record.set("isSchemaCanEditRight", canEdit);
									record.set("isSchemaCanDeleteRight", canDelete);
								}, scope);
						});
					},

					/**
					 * Возвращает значение права доступа на операцию изменения.
					 * @param rightLevel Уровеню доступа.
					 * @returns {boolean} Возвращает true если есть доступ на операцию, false - в противном случае.
					 */
					canEdit: function(rightLevel) {
						return RightUtilities.isSchemaCanEditRightConverter(rightLevel);
					},

					/**
					 * Возвращает значение права доступа на операцию удаления.
					 * @param rightLevel Уровеню доступа.
					 * @returns {boolean} Возвращает true если есть доступ на операцию, false - в противном случае.
					 */
					canDelete: function(rightLevel) {
						return RightUtilities.isSchemaCanDeleteRightConverter(rightLevel);
					},

					loadModel: function(result, callback, scope) {
						var entities = result.collection;
						var collection = scope.get("mailboxGridData");
						collection.clear();
						var results = {};
						var records = [];
						entities.each(function(entity) {
							var recordId = entity.get("Id");
							records.push(recordId);
							entity.values.isSchemaCanEditRight = false;
							entity.values.isSchemaCanDeleteRight = false;
							results[recordId] = Ext.create("Terrasoft.BaseViewModel", {
								rowConfig: {
									Id: { dataValueType: Terrasoft.DataValueType.GUID },
									UserName: {dataValueType: Terrasoft.DataValueType.TEXT },
									Type: {dataValueType: Terrasoft.DataValueType.LOOKUP },
									MailBoxOwner: {dataValueType: Terrasoft.DataValueType.TEXT}
								},
								values: entity.values
							});
						}, scope);
						collection.loadAll(results);
						callback(records, scope);
					},

					onActiveRowSelect: function(tag) {
						if (tag === "Delete") {
							this.onDeleteButtonClick();
						} else if (tag === "Edit") {
							this.onEditButtonClick();
						} else if (tag === "EditRights") {
							this.onEditRigthsButtonClick();
						}
					},
					onAddButtonClick: function() {
						this.openAddMailboxSyncSettings();
					},
					openAddMailboxSyncSettings: function() {
						sandbox.publish("PushHistoryState", {
							hash: "MailboxSynchronizationSettingsPageModule",
							stateObj: { id: null }
						});
					},

					/**
					 * Удаляет выбранный почтовый ящик и запланированные задания, запущенные по нему.
					 */
					onDeleteButtonClick: function() {
						var recordId = this.get("activeRowId");
						if (!recordId) {
							return;
						}
						var messageBoxConfig = {
							style: Terrasoft.MessageBoxStyles.BLUE
						};
						this.showConfirmationDialog(resources.localizableStrings.DeleteConfirmationEx,
								function getSelectedButton(returnCode) {
							if (returnCode !== Terrasoft.MessageBoxButtons.YES.returnCode) {
								return;
							}
							this.set("activeRowId", null);
							MaskHelper.ShowBodyMask();
							var deleteQuery = Ext.create("Terrasoft.DeleteQuery", {
								rootSchemaName: "MailboxSyncSettings"
							});
							deleteQuery.filters.addItem(
								deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									"Id", recordId));
							deleteQuery.execute(function(response) {
								if (!response.success) {
									MaskHelper.HideBodyMask();
									this.showConfirmationDialog(resources.localizableStrings.RecordCannotBeDeletedEx);
									var errorInfo = response.errorInfo;
									throw new Terrasoft.UnknownException({
										message: errorInfo.message
									});
								}
								this.removeScheduledSynchronizationJob(function() {
									this.getData();
								}, this);
							}, this);
						}, ["yes", "no"], messageBoxConfig);
					},

					/**
					 * Удаляет запланированные задания синхронизации почты для текущего пользователя.
					 * @param {Function} callback
					 * @param {Object} scope
					 */
					removeScheduledSynchronizationJob: function(callback, scope) {
						var methodName = "CreateDeleteSyncJob";
						ServiceHelper.callService({
							serviceName: "MailboxSynchronizationSettingsService",
							methodName: methodName,
							data: {create: false},
							callback: function(response) {
								var result = response[methodName + "Result"];
								if (result) {
									this.showInformationDialog(result);
									MaskHelper.HideBodyMask();
									return;
								}
								callback.call(scope);
							},
							scope: this
						});
					},
					onEditButtonClick: function() {
						var recordId = this.get("activeRowId");
						sandbox.publish("PushHistoryState", {
							hash: "MailboxSynchronizationSettingsPageModule",
							stateObj: {id: recordId}
						});
					},

					/**
					 * Открывает страницу настройки прав.
					 * @protected
					 * @virtual
					 */
					onEditRigthsButtonClick: function() {
						var rightsModuleId = sandbox.id + "_Rights";
						sandbox.loadModule("Rights", {
							renderTo: "centerPanel",
							id: rightsModuleId,
							keepAlive: true
						});
					}
				}
			});
		}

		function init() {
			var messages = {
				"GetRecordInfo": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			};
			sandbox.registerMessages(messages);
			var rightsModuleId = sandbox.id + "_Rights";
			sandbox.subscribe("GetRecordInfo", function() {
				var recordId = viewModel.get("activeRowId");
				var gridData = viewModel.get("mailboxGridData");
				var displayValue = gridData && gridData.get(recordId) && gridData.get(recordId).get("UserName");
				return {
					entitySchemaName: MailboxSyncSettings.name,
					entitySchemaCaption: MailboxSyncSettings.caption,
					primaryColumnValue: recordId,
					primaryDisplayColumnValue: displayValue
				};
			}, this, [rightsModuleId]);

			var state = sandbox.publish("GetHistoryState");
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish("ReplaceHistoryState", {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		}

		/**
		 * Открывает модуль добавления записи учетной почты, если указан флаг openAddMailboxSyncSettings.
		 * @private
		 */
		function openAddMailboxSyncSettingsIfNeed() {
			var state = sandbox.publish("GetHistoryState");
			if (state.state.openAddMailboxSyncSettings === true) {
				sandbox.publish("ReplaceHistoryState", {
					hash: state.hash.historyState
				});
				viewModel.methods.openAddMailboxSyncSettings();
			}
		}

		function render(renderTo) {
			sandbox.publish("ChangeHeaderCaption", {
				caption: resources.localizableStrings.WindowCaptionEx,
				dataViews: new Terrasoft.Collection()
			});
			sandbox.subscribe("NeedHeaderCaption", function() {
				sandbox.publish("InitDataViews", {caption: resources.localizableStrings.WindowCaptionEx});
			}, this);
			if (!viewModel) {
				viewModel = getViewModel();
				viewModel.getData();
			}
			var genView = getView();
			genView.bind(viewModel);
			genView.render(renderTo);
			openAddMailboxSyncSettingsIfNeed();
		}

		return {
			init: init,
			render: render
		};
	});