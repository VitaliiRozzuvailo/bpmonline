define("VisaPage", ["ext-base", "terrasoft", "VisaPageStructure", "VisaPageResources", "DocumentVisa",
	"ConfigurationEnums", "ActionButtonHelper", "VisaHelper",
	"BusinessRuleModule", "BaseVisa", "css!VisaHelper"],
	function(Ext, Terrasoft,  structure, resources, DocumentVisa, ConfigurationEnums,
	ActionButtonHelper, VisaHelper, BusinessRuleModule, BaseVisa) {
		structure.userCode = function() {
			var visaResources = VisaHelper.resources.localizableStrings;
			this.entitySchema = BaseVisa;
			this.name = "VisaCardViewModel";

			var config = {
				actions: [{
					name: "approve",
					color: "Green",
					caption: visaResources.Approve,
					click: {
						bindTo: "approve"
					}
				}, {
					name: "reject",
					color: "Red",
					caption: visaResources.Reject,
					click: {
						bindTo: "reject"
					}
				}, {
					name: "changeVizier",
					color: "Grey",
					caption: visaResources.ChangeVisaOwner,
					click: {
						bindTo: "changeVizier"
					}
				}]
			};
			var actionButtonsItem = ActionButtonHelper.getActionButtonsConfig(config);
			actionButtonsItem.type = ConfigurationEnums.CustomViewModelSchemaItem.CUSTOM_ELEMENT;
			actionButtonsItem.visible = {
				bindTo: "IsFinal",
				bindConfig: {
					converter: function(value) {
						return !value;
					}
				}
			};

			this.schema.leftPanel = [
				{
					type: Terrasoft.ViewModelSchemaItem.GROUP,
					name: "baseElementsControlGroup",
					visible: true,
					collapsed: false,
					wrapContainerClass: "main-elements-control-group-container",
					items: [{
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "Id",
						columnPath: "Id",
						visible: false,
						viewVisible: false
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "IsFinal",
						columnPath: "Status.IsFinal",
						visible: false,
						viewVisible: false
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "Objective",
						columnPath: "Objective",
						dataValueType: Terrasoft.DataValueType.TEXT
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "VisaOwner",
						columnPath: "VisaOwner",
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						lookupPageSettings: {
							captionLookup: VisaHelper.VisaLookupCaption
						}
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "IsAllowedToDelegate",
						columnPath: "IsAllowedToDelegate",
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "DelegatedFrom",
						columnPath: "DelegatedFrom",
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						lookupPageSettings: {
							captionLookup: VisaHelper.VisaLookupCaption
						}
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "Status",
						columnPath: "Status",
						dataValueType: Terrasoft.DataValueType.LOOKUP
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "SetBy",
						columnPath: "SetBy",
						dataValueType: Terrasoft.DataValueType.LOOKUP
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "SetDate",
						columnPath: "SetDate",
						dataValueType: Terrasoft.DataValueType.DATE_TIME
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "IsCanceled",
						columnPath: "IsCanceled",
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					}, {
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: "Comment",
						columnPath: "Comment",
						dataValueType: Terrasoft.DataValueType.TEXT,
						customConfig: {
							className: "Terrasoft.controls.MemoEdit",
							height: "100px"
						}
					},
					actionButtonsItem
					]
				}
			];

			this.actions = function() {
				var actions = [];
				actions.push({
					caption: "",
					className: "Terrasoft.MenuSeparator"
				}, {
					caption: visaResources.Approve,
					methodName: "approve"
				}, {
					caption: visaResources.Reject,
					methodName: "reject"
				});
				return actions;
			};
			this.methods.modificateBeforeBind = function() {
				this.set("isVisibleEditButton", false);
			};
			this.methods.getSchemaAdministratedByRecords = function() {
				return false;
			};
			this.methods.approve = function() {
				VisaHelper.approveAction(this, this.onSaved, this);
			};

			this.methods.reject = function() {
				VisaHelper.rejectAction(this, this.onSaved, this);
			};
			this.methods.changeVizier = function() {
				var scope = this;
				var currentId = this.get(this.entitySchema.primaryColumnName);
				var callback = function(response, updateObject) {
					for (var columnValue in updateObject) {
						scope.set(columnValue, updateObject[columnValue]);
					}
				};
				VisaHelper.changeVizierAction(
					currentId,
					this.entitySchema.name,
					this.getSandbox(),
					null,
					callback,
					this);
			};


		};

		return structure;
	});