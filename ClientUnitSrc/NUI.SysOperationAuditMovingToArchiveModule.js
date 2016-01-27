define("SysOperationAuditMovingToArchiveModule", ["ext-base", "terrasoft", "sandbox",
		"SysOperationAuditMovingToArchiveModuleResources", "LookupUtilities"],
	function(Ext, Terrasoft, sandbox, resources, LookupUtilities) {

		var view, viewModel;
		var container;

		function moveToArchive(dateFromValue, dateToValue, operationTypeList, returnBack) {
			var provider = Terrasoft.AjaxProvider;
			var data = {
				startDate: dateFromValue,
				endDate: dateToValue,
				operationTypes: operationTypeList
			};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/AuditService/MoveToArchive";
			provider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function(options, success, response) {
					if (success) {
						var result = Terrasoft.decode(response.responseText);
						var moveToArchiveResult = result.MoveToArchiveResult;
						var message;
						if (moveToArchiveResult === 0) {
							message = resources.localizableStrings.NoRecordToArchive;
						} else {
							message = Ext.String.format(resources.localizableStrings.ArchiveRecordCountCaption,
								moveToArchiveResult);
						}
						this.showInformationDialog(message, function() {
							if (returnBack) {
								sandbox.publish("BackHistoryState");
							}
						});
					}
				},
				scope: this
			});
		}

		function initModel() {
			var startDate = Terrasoft.startOfWeek(Ext.Date.add(new Date(), "d", 0));
			var dueDate = Terrasoft.endOfWeek(startDate);
			viewModel.set("dateFromValue", startDate);
			viewModel.set("dateToValue", dueDate);
			viewModel.set("operationTypeList", []);
		}

		function getView() {
			var container = Ext.create("Terrasoft.Container", {
				id: "generalContainer",
				selectors: {
					wrapEl: "#generalContainer"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "buttonsContainer",
						selectors: {
							wrapEl: "#buttonsContainer"
						},
						classes: {
							wrapClassName: ["buttons-container"]
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "btnOkContainer",
								selectors: {
									wrapEl: "#btnOkContainer"
								},
								classes: {
									wrapClassName: ["btnOk-container"]
								},
								items: [
									{
										className: "Terrasoft.Button",
										id: "btnOk",
										caption: resources.localizableStrings.BtnOKCaption,
										width: "100px",
										style: Terrasoft.controls.ButtonEnums.style.GREEN,
										click: {
											bindTo: "onOkBtnClick"
										}
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "btnCancelContainer",
								selectors: {
									wrapEl: "#btnCancelContainer"
								},
								classes: {
									wrapClassName: ["btnCancel-container"]
								},
								items: [
									{
										className: "Terrasoft.Button",
										id: "btnCancel",
										caption: resources.localizableStrings.BtnCancelCaption,
										width: "100px",
										style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
										click: {
											bindTo: "onCancelBtnClick"
										}
									}
								]
							}

						]
					},
					{
						className: "Terrasoft.Container",
						id: "periodContainer",
						selectors: {
							wrapEl: "#periodContainer"
						},
						classes: {
							wrapClassName: ["period-container"]
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "caption-dateFrom-label-container",
								selectors: {
									wrapEl: "#caption-dateFrom-label-container"
								},
								classes: {
									wrapClassName: ["caption-label-container"]
								},
								items: [
									{
										className: "Terrasoft.Label",
										id: "dateFromLabel",
										caption: resources.localizableStrings.LblDateFromCaption,
										classes: {
											labelClass: ["required-caption"]
										}
									}
								]
							},
							{
								className: "Terrasoft.DateEdit",
								id: "dateFrom",
								value: {
									bindTo: "dateFromValue"
								},
								width: "30%"
							},
							{
								className: "Terrasoft.Container",
								id: "caption-dateTo-label-container",
								selectors: {
									wrapEl: "#caption-dateTo-label-container"
								},
								classes: {
									wrapClassName: ["caption-dateTo-label-container"]
								},
								items: [
									{
										className: "Terrasoft.Label",
										id: "dateToLabel",
										caption: resources.localizableStrings.LblDateToCaption,
										classes: {
											labelClass: ["required-caption"]
										}
									}
								]
							},
							{
								className: "Terrasoft.DateEdit",
								id: "dateTo",
								value: {
									bindTo: "dateToValue"
								},
								width: "30%"
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "operationTypeContainer",
						selectors: {
							wrapEl: "#operationTypeContainer"
						},
						classes: {
							wrapClassName: ["operation-type-container"]
						},
						items: [
							{
								className: "Terrasoft.Label",
								id: "operationTypeLabel",
								caption: resources.localizableStrings.LblOperationTypeCaption,
								/*classes: {
									labelClass: ["required-caption"]
								},*/
								width: "20%"
							},
							{
								className: "Terrasoft.LookupEdit",
								id: "operationType",
								value: {
									bindTo: "DisplayOperationType"
								},
								list: {
									bindTo: "operationTypeList"
								},
								loadVocabulary: {
									bindTo: "onPrepareOperationTypeList"
								},
								/*change: {
									bindTo: "getLookupQuery"
								},*/
								width: "80%"
							}
						]
					}
				]
			});
			return container;
		}

		var columnsForLookup = [];

		function getViewModel() {
			var viewModel = Ext.create("Terrasoft.BaseViewModel", {
				columns: {
					dateFromValue: {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "dateFromValue",
						dataValueType: Terrasoft.DataValueType.DATE_TIME,
						isRequired: true
					},
					dateToValue: {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "dateToValue",
						dataValueType: Terrasoft.DataValueType.DATE_TIME,
						isRequired: true
					}
				},
				validationConfig: {
					dateFromValue: [
						function() {
							var result = {
								isValid: true,
								invalidMessage: ""
							};
							if (this.get("dateFromValue") >= this.get("dateToValue")) {
								result.isValid = false;
								result.invalidMessage = resources.localizableStrings.StartDateValidationMessage;
							} else if (!result.isValid) {
								result.isValid = true;
								result.invalidMessage = "";
							}
							return result;
						}
					],
					dateToValue: [
						function() {
							var result = {
								isValid: true,
								invalidMessage: ""
							};
							if (this.get("dateToValue") <= this.get("dateFromValue")) {
								result.isValid = false;
								result.invalidMessage = resources.localizableStrings.DueDateValidationMessage;
							} else if (!result.isValid) {
								result.isValid = true;
								result.invalidMessage = "";
							}
							return result;
						}
					]
				},
				values: {
					operationTypeList: new Terrasoft.Collection(),
					dateFromValue: Terrasoft.SystemValueType.CURRENT_DATE,
					dateToValue: Terrasoft.SystemValueType.CURRENT_DATE
				},
				methods: {
					onOkBtnClick: function() {
						if (this.validate()) {
							var dateFromValue = viewModel.get("dateFromValue").toJSON().substring(0, 10);
							var tempDateToValue = viewModel.get("dateToValue");
							tempDateToValue.setDate(viewModel.get("dateToValue").getDate() + 1);
							var dateToValue = tempDateToValue.toJSON().substring(0, 10);
							var operationTypeList = [];
							Terrasoft.each(viewModel.get("operationTypeCollectionItems"), function(item) {
								operationTypeList.push(item.Code);
							});
							moveToArchive.call(this, dateFromValue, dateToValue, operationTypeList, true);
						}
					},
					onCancelBtnClick: function() {
						sandbox.publish("BackHistoryState");
					},
					getLookupQuery: function(filterValue, columnName) {
						var esq = this.callParent(arguments);
						var filters = this.getLookupFilters.call(this, columnName);
						Terrasoft.each(columnsForLookup, function(itemName) {
							esq.addColumn(itemName);
						}, this);
						esq.filters.addItem(filters);
						return esq;
					},
					getLookupFilters: function(columnName) {
						var filters = Ext.create("Terrasoft.FilterGroup");
						columnsForLookup = [columnName, "Code"];
						return filters;
					},
					onPrepareOperationTypeList: function() {
						this.scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
						var handler = function(args) {
							var t = {
								displayValue: ""
							};
							this.values.operationTypeList = [];
							Terrasoft.each(args.selectedRows.collection.items, function(item) {
								this.values.operationTypeList.push(item.value);
								t.displayValue += item.displayValue + "; ";
							}, this);
							this.set("DisplayOperationType", t);
							this.set("operationTypeList", this.values.operationTypeList);
							this.set("operationTypeCollectionItems", args.selectedRows.collection.items);
						};
						if (!this.get("DisplayOperationType")) {
							this.values.operationTypeList = [];
						}
						var config = {
							entitySchemaName: "SysOperationType",
							selectedRows: this.values.operationTypeList,
							multiSelect: true
						};
						LookupUtilities.Open(sandbox, config, handler, this, container, true);
					}
				}
			});
			return viewModel;
		}

		var init = function() {
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
		};

		function render(renderTo) {
			var headerCaption = resources.localizableStrings.WindowCaption;
			sandbox.publish("ChangeHeaderCaption", {
				caption: headerCaption,
				dataViews: new Terrasoft.Collection()
			});
			sandbox.subscribe("NeedHeaderCaption", function() {
				sandbox.publish("InitDataViews", { caption: headerCaption });
			}, this);

			view = getView();
			if (!viewModel) {
				viewModel = getViewModel();
				initModel();
			}
			container = renderTo;
			view.bind(viewModel);
			view.render(renderTo);
		}

		return {
			init: init,
			render: render
		};
	});