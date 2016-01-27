define("MailboxFolderSyncSettingsModule", ["sandbox", "ext-base", "terrasoft",
	"MailboxFolderSyncSettingsModuleResources", "MaskHelper", "ServiceHelper", "ExchangeNUIConstants"],
	function(sandbox, Ext, Terrasoft, resources, MaskHelper, ServiceHelper, ExchangeNUIConstants) {

		function getView(hierarchical) {
			var isHierarchical = (hierarchical !== undefined) ? hierarchical : true;
			var container = Ext.create("Terrasoft.Container", {
				id: "main",
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
						items: [
							{
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.GREEN,
								caption: resources.localizableStrings.SaveButtonCaptionEx,
								click: {
									bindTo: "onSaveButtonClick"
								}
							},
							{
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.GRAY,
								caption: resources.localizableStrings.CancelButtonCaptionEx,
								click: {
									bindTo: "onCancelButtonClick"
								}
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "mainContainer",
						selectors: {
							wrapEl: "#mainContainer"
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "leftContainer",
								classes: {
									wrapClassName: [
										"left-container"
									]
								},
								selectors: {
									wrapEl: "#leftContainer"
								},
								items: [
									{
										className: "Terrasoft.Grid",
										id: "main-grid",
										type: "listed",
										hierarchical: isHierarchical,
										multiSelect: true,
										primaryColumnName: "Id",
										hierarchicalColumnName: "ParentId",
										expandHierarchyLevels: {
											bindTo: "expandHierarchy"
										},
										activeRow: {
											bindTo: "activeRowId"
										},
										selectedRows: {
											bindTo: "selectedRows"
										},
										columnsConfig: [
											{
												cols: 24,
												key: [
													{
														name: {
															bindTo: "Name"
														}
													}
												]
											}
										],
										collection: {
											bindTo: "folderGridData"
										},
										watchedRowInViewport: {
											bindTo: "loadNext"
										}
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "rightContainer",
								visible: false,
								classes: {
									wrapClassName: [
										"right-container"
									]
								},
								selectors: {
									wrapEl: "#rightContainer"
								},
								items: [
									{
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.FolderCreateSectionEx,
										classes: {
											labelClass: ["section-caption-label"]
										},
										width: "100%"
									},
									{
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.AddFolderCaptionEx,
										classes: {
											labelClass: ["caption-label"]
										},
										width: "100%"
									},
									{
										id: "NewFolderNameEdit",
										className: "Terrasoft.TextEdit",
										value: {
											bindTo: "NewFolderName"
										},
										classes: {
											wrapClassName: [
												"button-margin"
											]
										}
									},
									{
										className: "Terrasoft.Button",
										style: Terrasoft.controls.ButtonEnums.style.GREEN,
										caption: resources.localizableStrings.AddButtonCaptionEx,
										click: {
											bindTo: "onAddButtonClick"
										}
									}
								]
							}
						]
					}
				]
			});
			return container;
		}

		function getViewModel() {
			return Ext.create("Terrasoft.BaseViewModel", {
				values: {
					activeRowId: null,
					folderGridData: new Terrasoft.Collection(),
					NewFolderName: null,
					mailboxId: null,
					mailboxName: null,
					mailServerId: null,
					mailboxPassword: null,
					selectedRows: null,
					mailServerTypeId: null,
					expandHierarchy: null,
					folders: null,
					folderClassName: null,
					groupSchemaName: null,
					groupSchemaFilters: null
				},
				methods: {
					getData: function() {
						MaskHelper.ShowBodyMask();
						switch (this.get("folderClassName")) {
							case ExchangeNUIConstants.ExchangeFolder.BPMContact.Name:
								this.set("groupSchemaName", ExchangeNUIConstants.ExchangeFolder.BPMContact.SchemaName);
								this.set("groupSchemaFilters",
									ExchangeNUIConstants.ExchangeFolder.BPMContact.SchemaFilters);
								this.getGroupsFromBpm();
								break;
							case ExchangeNUIConstants.ExchangeFolder.BPMActivity.Name:
								this.set("groupSchemaName", ExchangeNUIConstants.ExchangeFolder.BPMActivity.SchemaName);
								this.set("groupSchemaFilters",
									ExchangeNUIConstants.ExchangeFolder.BPMActivity.SchemaFilters);
								this.getGroupsFromBpm();
								break;
							default:
								var mailServerTypeId = this.get("mailServerTypeId");
								if (mailServerTypeId === undefined) {
									this.getExchangeServerType(this.get("mailServerId"), this.getFoldersFromService);
								} else {
									this.getFoldersFromService();
								}
								break;
						}
					},
					getFoldersFromService: function() {
						var data = {}, requestUrl = "";
						switch (this.get("mailServerTypeId")) {
							case ExchangeNUIConstants.MailServer.Type.Exchange:
								requestUrl = Terrasoft.workspaceBaseUrl + "/rest/ExchangeSyncService/GetMailboxFolders";
								data = {
									mailServerId: this.get("mailServerId"),
									mailboxName: this.get("mailboxName"),
									mailboxPassword: this.get("mailboxPassword"),
									senderEmailAddress: this.get("senderEmailAddress"),
									folderClassName: this.get("folderClassName")
								};
								break;
							case ExchangeNUIConstants.MailServer.Type.Imap:
								requestUrl = Terrasoft.workspaceBaseUrl + "/rest/ImapUtilitiesService/GetMailboxFolders";
								data = {
									mailboxId: this.get("mailboxId"),
									mailboxName: this.get("mailboxName"),
									mailServerId: this.get("mailServerId"),
									mailboxPassword: this.get("mailboxPassword")
								};
								break;
							default :
								break;
						}
						Ext.Ajax.request({
							url: requestUrl,
							headers: {
								"Accept": "application/json",
								"Content-Type": "application/json"
							},
							method: "POST",
							jsonData: data,
							success: function(response) {
								var responseItems = Terrasoft.decode(response.responseText);
								this.fillGrid(responseItems);
							},
							scope: this
						});
					},
					getGroupsFromBpm: function() {
						function getItem(item) {
							return {
								Id: item.get("Id"),
								Name: item.get("Name"),
								ParentId: item.get("Parent") ? item.get("Parent").value : "",
								Path: item.get("Id")
							};
						}
						var filtersArray = this.get("groupSchemaFilters");
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: this.get("groupSchemaName")
						});
						select.addColumn("Id");
						select.addColumn("Name");
						select.addColumn("Parent");
						if (filtersArray && Ext.isArray(filtersArray) && filtersArray.length > 0) {
							filtersArray.forEach(function(element) {
								select.filters.addItem(element);
							});
						}
						select.getEntityCollection(function(response) {
							var collection = response.collection;
							var resultItems = [];
							var rootId = Terrasoft.utils.generateGUID();
							resultItems.push({
								Id: rootId,
								Name: this.get("mailboxName"),
								ParentId: "",
								Path: ""
							});
							if (collection.getCount() > 0) {
								collection.each(function(item) {
									var itemToAdd = getItem(item);
									if (!itemToAdd.ParentId) {
										itemToAdd.ParentId = rootId;
									}
									resultItems.push(itemToAdd);
								}, this);
							}
							this.fillGrid(resultItems);
						}, this);
					},
					getExchangeServerType: function(serverId, callback) {
						var context = this;
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "MailServer"
						});
						select.addColumn("Type.Id", "TypeId");
						select.getEntity(serverId, function(result) {
							if (result.success) {
								var entity = result.entity;
								context.set("mailServerTypeId", entity.get("TypeId"));
							} else {
								context.set("mailServerTypeId", ExchangeNUIConstants.MailServer.Type.Imap);
							}
							callback.call(context);
						}, this);
					},
					onAddButtonClick: function() {
						var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/ImapUtilitiesService/CreateNewFolder";
						var data = {
							newFolderPath: this.get("NewFolderName"),
							mailboxId: this.get("mailboxId")
						};
						var scope = this;
						Ext.Ajax.request({
							url: requestUrl,
							headers: {
								"Accept": "application/json",
								"Content-Type": "application/json"
							},
							method: "POST",
							jsonData: data,
							success: function() {
								scope.set("NewFolderName", "");
							},
							scope: this
						});
					},
					onSaveButtonClick: function() {
						this.saveChosenFoldersList();
					},
					onCancelButtonClick: function() {
						sandbox.publish("BackHistoryState");
					},
					saveChosenFoldersList: function() {
						var selectedRows = this.get("selectedRows");
						var collection = this.get("folderGridData").collection.items;
						var checkedCollection = new Array(collection.length);
						for (var i = 0; i < collection.length; i++) {
							checkedCollection[i] = Terrasoft.deepClone(collection[i].values);
							checkedCollection[i].isChecked = (Ext.Array.indexOf(selectedRows,
								checkedCollection[i].Id) > -1) || (checkedCollection[i].ParentId === null) ||
								(checkedCollection[i].ParentId === "");
						}
						for (var j = 0; j < checkedCollection.length; j++) {
							var currentItem = checkedCollection[j];
							if (currentItem.isChecked) {
								continue;
							}
							var currentItemId = currentItem.Id;
							var currentItemParentId = currentItem.ParentId;
							for (var k = 0; k < checkedCollection.length; k++) {
								if (checkedCollection[k].ParentId === currentItemId) {
									checkedCollection[k].ParentId = currentItemParentId;
								}
							}
						}
						var l = 0;
						while (l < checkedCollection.length) {
							if (!checkedCollection[l].isChecked) {
								checkedCollection.splice(l, 1);
							} else {
								l++;
							}
						}
						sandbox.publish("ResultSelectedRows", {
							folders: checkedCollection
						}, [sandbox.id]);
						sandbox.publish("BackHistoryState");
					},
					fillGrid: function(responseItems) {
						var folders = this.get("folders");
						var collection = this.get("folderGridData");
						collection.clear();
						var results = {};
						var selectedRows = [];
						var rootFolder = responseItems[0];
						selectedRows.push(rootFolder.Id);
						this.set("expandHierarchy", [rootFolder.Id]);
						var compareFunction = function(element) {
							return element.Path === path;
						};
						for (var i = 0; i < responseItems.length; i++) {
							var exchangeFolder = responseItems[i];
							results[exchangeFolder.Id] = Ext.create("Terrasoft.BaseViewModel", {
								rowConfig: {
									Id: {dataValueType: Terrasoft.DataValueType.TEXT},
									Name: {dataValueType: Terrasoft.DataValueType.TEXT},
									ParentId: {dataValueType: Terrasoft.DataValueType.TEXT},
									Path: {dataValueType: Terrasoft.DataValueType.TEXT}
								},
								values: exchangeFolder
							});
							var path = exchangeFolder.Path;
							if (folders.length > 0) {
								var filteredArray = folders.filter(compareFunction);
								if (filteredArray.length > 0) {
									selectedRows.push(exchangeFolder.Id);
								}
							} else {
								if (exchangeFolder.Selected) {
									selectedRows.push(exchangeFolder.Id);
								}
							}
						}
						collection.loadAll(results);
						this.set("selectedRows", selectedRows);
						var map = collection.collection.map;
						var keys = collection.collection.keys;
						var items = collection.getItems();
						for (var j = 0; j < items.length; j++) {
							var item = items[j];
							var itemId = item.values.Id;
							map[itemId] = item;
							keys[j] = itemId;
						}
						MaskHelper.HideBodyMask();
					}
				}
			});
		}

		function init() {
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

		function render(renderTo) {
			sandbox.publish("InitDataViews", {
				caption: resources.localizableStrings.WindowCaptionEx,
				dataViews: false
			});
			var parameters = sandbox.publish("GetParams", null, [sandbox.id]);
			var folderClassName = parameters.folderClassName;
			var exchangeFolder = ExchangeNUIConstants.ExchangeFolder;
			var isFoldersGridHierarchical = (folderClassName !== exchangeFolder.BPMContact.Name &&
				folderClassName !== exchangeFolder.BPMActivity.Name);
			var view = getView(isFoldersGridHierarchical);
			var viewModel = getViewModel();
			if (parameters) {
				viewModel.set("mailboxId", parameters.mailboxId);
				viewModel.set("mailboxName", parameters.mailboxName);
				viewModel.set("mailServerId", parameters.mailServerId);
				viewModel.set("mailboxPassword", parameters.mailboxPassword);
				viewModel.set("mailServerTypeId", parameters.mailServerTypeId);
				viewModel.set("senderEmailAddress", parameters.senderEmailAddress);
				viewModel.set("folders", parameters.folders);
				viewModel.set("folderClassName", folderClassName);
				viewModel.getData();
			}
			view.bind(viewModel);
			view.render(renderTo);
		}

		return {
			init: init,
			render: render
		};
	});
