define("MailboxSynchronizationSettingsModule", ["sandbox", "ext-base", "terrasoft",
		"MailboxSynchronizationSettingsModuleResources", "ServiceHelper", "MaskHelper"],
	function(sandbox, Ext, Terrasoft, resources, ServiceHelper, MaskHelper) {
		var viewModel = null;
		var viewConfig;

		function getView() {
			viewConfig = Ext.create("Terrasoft.Container", {
				id: "main",
				markerValue: resources.localizableStrings.WindowCaption,
				selectors: {
					wrapEl: "#main"
				},
				items: [
					{
						className: "Terrasoft.Label",
						caption: resources.localizableStrings.WindowCaption,
						classes: {
							labelClass: ["page-caption-label"]
						},
						width: "100%"
					},
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
								caption: resources.localizableStrings.AddButtonCaption,
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
								type: "tiled",
								primaryColumnName: "Id",
								primaryDisplayColumnName: "UserName",
								activeRow: {
									bindTo: "activeRowId"
								},
								columnsConfig: [
									[
										{
											cols: 24,
											key: [
												{
													name: {
														bindTo: "UserName"
													},
													type: "title"
												}
											]
										}
									]
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
										caption: resources.localizableStrings.EditButtonCaption,
										markerValue: resources.localizableStrings.EditButtonCaption,
										tag: "Edit"
									},
									{
										className: "Terrasoft.Button",
										style: Terrasoft.controls.ButtonEnums.style.GREY,
										caption: resources.localizableStrings.DeleteButtonCaption,
										markerValue: resources.localizableStrings.DeleteButtonCaption,
										tag: "Delete"
									}
								],
								watchedRowInViewport: {
									bindTo: "loadNext"
								}
							}
						]
					}
				]
			});
			return viewConfig;
		}

		function getViewModel() {
			return Ext.create("Terrasoft.BaseViewModel", {
				values: {
					activeRowId: null,
					mailboxGridData: Ext.create("Terrasoft.BaseViewModelCollection")
				},
				methods: {

					getData: function() {
						Ext.Ajax.request({
							url: Terrasoft.workspaceBaseUrl + "/rest/ImapUtilitiesService/GetMailboxes",
							headers: {
								"Accept": "application/json",
								"Content-Type": "application/json"
							},
							method: "POST",
							success: function(response) {
								var responseItems = Terrasoft.decode(response.responseText);
								var collection = this.get("mailboxGridData");
								collection.clear();
								var results = {};
								for (var i = 0; i < responseItems.length; i++) {
									var mailbox = responseItems[i];
									results[mailbox.Id] = Ext.create("Terrasoft.BaseViewModel", {
										rowConfig: {
											Id: { dataValueType: Terrasoft.DataValueType.GUID },
											UserName: {dataValueType: Terrasoft.DataValueType.TEXT }
										},
										values: mailbox
									});
								}
								collection.loadAll(results);
								var map = collection.collection.map;
								var keys = collection.collection.keys;
								var items = collection.getItems();
								for (var y = 0; y < items.length; y++) {
									var item = items[y];
									var itemId = item.values.Id;
									map[itemId] = item;
									keys[y] = itemId;
								}
								MaskHelper.HideBodyMask();
							},
							scope: this
						});
					},

					onActiveRowSelect: function(tag) {
						if (tag === "Delete") {
							this.onDeleteButtonClick();
						} else if (tag === "Edit") {
							this.onEditButtonClick();
						}
					},

					onAddButtonClick: function() {
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
						this.showConfirmationDialog(resources.localizableStrings.DeleteConfirmation,
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
									this.showConfirmationDialog(resources.localizableStrings.RecordCannotBeDeleted);
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
					 * @param {Function} callback Функция обратного вызова.
					 * @param {Object} scope Контекст вызова функции обратного вызова.
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
									MaskHelper.HideBodyMask();
									this.showInformationDialog(result);
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
					}
				}
			});
		}

		function init() {

		}

		function render(renderTo) {
			if (viewModel) {
				var config = Terrasoft.deepClone(viewConfig);
				var genView = Ext.create(config.className || "Terrasoft.Container", config);
				genView.bind(viewModel);
				genView.render(renderTo);
				return;
			}
			var view = getView();
			viewModel = getViewModel();
			viewModel.getData();
			view.bind(viewModel);
			view.render(renderTo);
		}

		return {
			init: init,
			render: render
		};
	});