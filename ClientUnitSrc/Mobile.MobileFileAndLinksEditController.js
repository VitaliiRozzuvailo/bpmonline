Ext.define("FileAndLinksEditPage.Controller", {
	extend: "Terrasoft.controller.BaseEditPage",

	fileModel: null,

	inheritableStatics: {

		addDefaultBusinessRules: function() {
			var fileModel = this.prototype.fileModel;
			Terrasoft.sdk.Model.addBusinessRule(fileModel, {
				ruleType: Terrasoft.RuleTypes.Requirement,
				requireType: Terrasoft.RequirementTypes.OneOf,
				message: LocalizableStrings["Sys.RequirementRule.message"],
				triggeredByColumns: ["Data", "Name"]
			});
			Terrasoft.sdk.Model.addBusinessRule(fileModel, {
				ruleType: Terrasoft.RuleTypes.Visibility,
				conditionalColumns: [
					{name: "Type", value: Terrasoft.Configuration.FileTypeGUID.File}
				],
				events: [Terrasoft.BusinessRuleEvents.Load],
				dependentColumnNames: ["Data"]
			});
			Terrasoft.sdk.Model.addBusinessRule(fileModel, {
				ruleType: Terrasoft.RuleTypes.Visibility,
				conditionalColumns: [
					{name: "Type", value: Terrasoft.Configuration.FileTypeGUID.Link}
				],
				events: [Terrasoft.BusinessRuleEvents.Load],
				dependentColumnNames: ["Name"]
			});
		}

	},

	onEmbeddedDetailAddButtonTap: function(embeddedDetail) {
		if (Terrasoft.util.getColumnSetId(this.fileModel) === embeddedDetail.getId()) {
			this.currentArguments = arguments;
			this.showFileTypePicker();
		} else {
			this.callParent(arguments);
		}
	},

	processLink: function(record) {
		var typeId = record.get("Type").getId();
		if (Terrasoft.Configuration.FileTypeGUID.Link === typeId && !Ext.isEmpty(record.get("Data"))) {
			/*
			HACK: Для бинарных колонок(поле Data) OData всегда возвращает некое значение,
			хотя в случае ссылок на файл это не верно. Здесь мы затираем это значение.
			И чтоб колонка не считалась измененной, делаем это напрямую.
			*/
			record.data.Data = null;
		}
	},

	processEmbeddedDetailItemApplied: function(record, fileTypeRecord, args) {
		record.set("Type", fileTypeRecord);
		this.processLink(record);
		Terrasoft.controller.BaseEditPage.prototype.onEmbeddedDetailItemApplied.apply(this, args);
	},

	onEmbeddedDetailItemApplied: function(record, detailItem) {
		if (record.modelName !== this.fileModel) {
			this.callParent(arguments);
			return;
		}
		if (!record.phantom) {
			this.processLink(record);
			this.callParent(arguments);
			return;
		}
		var me = this;
		var args = arguments;
		var fileTypeModel = Ext.ModelManager.getModel("FileType");
		var isSimple = fileTypeModel.isSimple();
		if (isSimple) {
			var fileTypeRecord = Terrasoft.model.BaseModel.getSimpleLookupRecord(this.currentFileTypeGUID, "FileType");
			this.processEmbeddedDetailItemApplied(record, fileTypeRecord, args);
		} else {
			fileTypeModel.load(this.currentFileTypeGUID, {
				success: function(loadedRecord) {
					me.processEmbeddedDetailItemApplied(record, loadedRecord, args);
				},
				failure: function(exception) {
					Terrasoft.controller.BaseEditPage.prototype.onEmbeddedDetailItemApplied.apply(me, args);
				}
			});
		}
		this.currentFileTypeGUID = null;
	},

	showFileTypePicker: function() {
		var picker = this.getFileTypePicker();
		if (!picker.getParent()) {
			Ext.Viewport.add(picker);
		}
		picker.show();
	},

	getFileTypePicker: function() {
		if (!this.fileTypePicker) {
			var pickerStore = Ext.create("Terrasoft.store.BaseStore", {
				model: "FileType"
			});
			var queryConfig =  Ext.create("Terrasoft.QueryConfig", {
				modelName: "FileType"
			});
			pickerStore.load({
				queryConfig: queryConfig,
				filters: Ext.create("Terrasoft.Filter", {
					type: Terrasoft.FilterTypes.Group,
					logicalOperation: Terrasoft.FilterLogicalOperations.Or,
					subfilters: [
						{
							property: "Id",
							value: Terrasoft.Configuration.FileTypeGUID.File
						},
						{
							property: "Id",
							value: Terrasoft.Configuration.FileTypeGUID.Link
						}
					]
				})
			});
			this.fileTypePicker = Ext.create("Ext.Terrasoft.ComboBoxPicker", {
					component: {
						primaryColumn: "Name",
						store: pickerStore,
						listeners: {
							scope: this,
							itemtap: this.onFileTypePickerItemTap
						},
						disableSelection: true
					},
					toolbar: {
						clearButton: false
					},
					title: LocalizableStrings["OpportunityEditPage_FileTypePicker_title"],
					popup: true
				}
			);
		}
		return this.fileTypePicker;
	},

	onFileTypePickerItemTap: function(el, index, target, record) {
		this.currentFileTypeGUID = record.getId();
		Terrasoft.controller.BaseEditPage.prototype.onEmbeddedDetailAddButtonTap.apply(this, this.currentArguments);
	}

});