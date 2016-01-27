define("MobileDesignerConverter", ["MobileDesignerConverterResources", "SectionDesignerUtils", "MobileDesignerUtils"],
	function(resources, SectionDesignerUtils, MobileDesignerUtils) {
		return {
			entitySchemaName: "SysMobileWorkplace",

			methods: {

				/**
				 * @private
				 */
				processedSettingsPages: 0,

				/**
				 * @private
				 */
				defaultWorkplaceCode: "DefaultWorkplace",

				/**
				 * @private
				 */
				findSchema: function(config) {
					var schemaName = config.schemaName;
					var packageUId = config.packageUId;
					var isRoot = config.isRoot;
					var callback = config.callback;
					var allSchemas = Terrasoft.ClientUnitSchemaManager.getItems();
					var schemas = allSchemas.filterByFn(function(item) {
						var itemName = item.name;
						if (packageUId) {
							return (itemName === schemaName && item.packageUId === packageUId);
						} else if (isRoot) {
							return (itemName === schemaName && !item.extendParent);
						} else {
							return (itemName === schemaName);
						}
					});
					var schema = schemas.getByIndex(0);
					if (schema) {
						schema.getInstance(function(schemaInstance) {
							Ext.callback(callback, this, [schemaInstance]);
						}, this);
					} else {
						Ext.callback(callback, this, [null]);
					}
				},

				/**
				 * @private
				 */
				setDefaultSchemaCaption: function(schemaInstance, caption) {
					schemaInstance.setLocalizableStringPropertyValue("caption", caption, "ru-RU");
					schemaInstance.setLocalizableStringPropertyValue("caption", caption, "en-GB");
				},

				/**
				 * @private
				 */
				renameSettingsPage: function(schema, totalSchemaCounts, callback) {
					if (schema) {
						var schemaName = schema.name;
						if (!MobileDesignerUtils.isSchemaFromWorkplace(schemaName, this.defaultWorkplaceCode)) {
							var newSchemaName = MobileDesignerUtils.getSchemaNameByWorkplace(schemaName, this.defaultWorkplaceCode);
							schema.setPropertyValue("name", newSchemaName);
							this.setDefaultSchemaCaption(schema, newSchemaName);
						}
					}
					this.processedSettingsPages++;
					if (this.processedSettingsPages === totalSchemaCounts) {
						Ext.callback(callback, this);
					}
				},

				/**
				 * @private
				 */
				processSettingsPages: function(config) {
					var settingsPages = config.settingsPages;
					var settingsPagesCount = settingsPages.length;
					if (settingsPagesCount === 0) {
						Ext.callback(config.callback, this);
						return;
					}
					this.processedSettingsPages = 0;
					for (var i = 0; i < settingsPagesCount; i++) {
						var settingsPage = settingsPages[i];
						this.findSchema({
							schemaName: settingsPage,
							packageUId: config.packageUId,
							callback: function(schema) {
								this.renameSettingsPage(schema, settingsPagesCount, config.callback);
							}
						});
					}
				},

				/**
				 * @private
				 */
				renameManifest: function(manifestSchema, callback) {
					var rootManifestName = "MobileApplicationManifestDefaultWorkplace";
					if (manifestSchema.name === "MobileApplicationManifestMobile") {
						manifestSchema.setPropertyValue("extendParent", false);
						manifestSchema.setPropertyValue("parentSchemaUId", null);
						manifestSchema.setPropertyValue("name", rootManifestName);
						this.setDefaultSchemaCaption(manifestSchema, rootManifestName);
						Ext.callback(callback, this);
					} else {
						this.findSchema({
							schemaName: rootManifestName,
							isRoot: true,
							callback: function(rootManifest) {
								if (rootManifest) {
									var newManifestSchema = this.createSchema({
										schemaName: rootManifestName,
										packageUId: manifestSchema.packageUId,
										parentSchemaUId: rootManifest.uId,
										extendParent: true
									});
									newManifestSchema.setPropertyValue("body", manifestSchema.body);
									var itemsCollection = manifestSchema.localizableStrings.collection;
									var me = this;
									itemsCollection.eachKey(function(key, item) {
										me.addLocalizableString(newManifestSchema, key, item.getValue());
									});
								}
								Ext.callback(callback, this);
							}
						});
					}
				},

				/**
				 * @private
				 */
				createSchema: function(config) {
					var schemaName = config.schemaName;
					var packageUId = config.packageUId;
					var schema = Terrasoft.ClientUnitSchemaManager.createSchema({
						uId: Terrasoft.generateGUID(),
						name: schemaName,
						packageUId: packageUId,
						parentSchemaUId: config.parentSchemaUId,
						extendParent: config.extendParent,
						caption: {
							"ru-RU": schemaName,
							"en-GB": schemaName
						}
					});
					Terrasoft.ClientUnitSchemaManager.addSchema(schema);
					return schema;
				},

				/**
				 * @private
				 */
				addLocalizableString: function(schemaInstance, name, value) {
					var localizableStringItem = schemaInstance.localizableStrings.find(name);
					if (localizableStringItem) {
						localizableStringItem.setValue(value);
					} else {
						var localizableString = Ext.create("Terrasoft.LocalizableString", {
							cultureValues: {
								"ru-RU": value,
								"en-GB": value
							}
						});
						schemaInstance.localizableStrings.add(name, localizableString);
					}
				},

				/**
				 * @private
				 */
				processSettingsPagesCallback: function(manifestSchema) {
					this.renameManifest(manifestSchema, function() {
						Terrasoft.ClientUnitSchemaManager.save(this.processDefaultWorkplace, this);
					});
				},

				/**
				 * @private
				 */
				showMessage: function(message, callback) {
					var msgBoxConfig = {
						style: Terrasoft.MessageBoxStyles.BLUE
					};
					Terrasoft.showInformation(message, callback, this, msgBoxConfig);
				},

				/**
				 * @private
				 */
				processManifest: function(manifestSchema) {
					if (!manifestSchema) {
						this.showMessage(resources.localizableStrings.OldManifestWasNotFound);
						return;
					}
					var packageUId = manifestSchema.packageUId;
					var body = manifestSchema.body;
					var manifest = JSON.parse(body);
					var models = manifest.Models;
					var allSettingsPages = [];
					for (var model in models) {
						var pages = models[model].PagesExtensions;
						if (!pages) {
							continue;
						}
						for (var i = 0, ln = pages.length; i < ln; i++) {
							var page = pages[i];
							if (page.endsWith("Settings")) {
								allSettingsPages = Ext.Array.union(allSettingsPages, [pages[i]]);
								pages[i] = page + this.defaultWorkplaceCode;
							}
						}
					}
					manifestSchema.setPropertyValue("body", JSON.stringify(manifest, null, "\t"));
					this.processSettingsPages({
						settingsPages: allSettingsPages,
						packageUId: packageUId,
						callback: function() {
							this.processSettingsPagesCallback(manifestSchema);
						}
					});
				},

				/**
				 * @private
				 */
				getCurrentPackageUId: function() {
					var storage = Terrasoft.DomainCache;
					return storage.getItem("SectionDesigner_CurrentPackageUId");
				},

				/**
				 * @private
				 */
				getCurrentPackageName: function() {
					var storage = Terrasoft.DomainCache;
					return storage.getItem("SectionDesigner_CurrentPackageName");
				},

				/**
				 * @private
				 */
				processDefaultWorkplace: function() {
					var me = this;
					var finalCallback = function() {
						me.showMessage(resources.localizableStrings.CompletionMessage);
					};
					this.doesDefaultWorkplaceExist(function(exists) {
						if (!exists) {
							this.addDefaultWorkplace(finalCallback);
						} else {
							finalCallback();
						}
					});
				},

				/**
				 * @private
				 */
				doesDefaultWorkplaceExist: function(callback) {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					esq.addColumn("Id");
					esq.addColumn("Code", "Code");
					esq.filters.add("filterCode", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Code", "DefaultWorkplace"));
					esq.getEntityCollection(function(result) {
						var items = result.collection.getItems();
						var exists = result.success && (items.length > 0);
						Ext.callback(callback, this, [exists]);
					}, this);
				},

				/**
				 * @private
				 */
				addDefaultWorkplace: function(callback) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: this.entitySchemaName
					});
					insert.setParameterValue("Name", resources.localizableStrings.DefaultWorkplaceCaption,
						Terrasoft.DataValueType.TEXT);
					insert.setParameterValue("Code", "DefaultWorkplace", Terrasoft.DataValueType.TEXT);
					insert.execute(callback, this);
				},

				/**
				 * Производит конвертацию настроек мобильного приложения.
				 */
				convertSettings: function() {
					Terrasoft.ClientUnitSchemaManager.initialize(function() {
						SectionDesignerUtils.getCurrentPackageUId(function(result) {
							if (!result) {
								return;
							}
							var packageName = this.getCurrentPackageName();
							this.findSchema({
								schemaName: MobileDesignerUtils.getManifestNameByPackage(packageName),
								callback: this.processManifest
							});
						}, this);
					}, this);
				}

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "ActionButtonsContainer",
					"propertyName": "items",
					"name": "ConvertSettingsButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.ConvertSettingsButtonCaption"
						},
						"classes": {
							"textClass": "actions-button-margin-right"
						},
						"click": {
							"bindTo": "convertSettings"
						},
						"style": "default",
						"layout": {
							"column": 4,
							"row": 0,
							"colSpan": 2
						}
					}
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "remove",
					"name": "SeparateModePrintButton"
				},
				{
					"operation": "merge",
					"name": "DataGridActiveRowOpenAction",
					"values": {
						"style": Terrasoft.controls.ButtonEnums.style.GREY
					}
				},
				{
					"operation": "remove",
					"name": "CombinedModePrintButton"
				},
				{
					"operation": "remove",
					"name": "CombinedModeViewOptionsButton"
				},
				{
					"operation": "remove",
					"name": "SeparateModeViewOptionsButton"
				},
				{
					"operation": "remove",
					"name": "SeparateModeActionsButton"
				},
				{
					"operation": "remove",
					"name": "FiltersContainer"
				},
				{
					"operation": "remove",
					"name": "SeparateModeAddRecordButton"
				},
				{
					"operation": "remove",
					"name": "CombinedModeAddRecordButton"
				}
			]/**SCHEMA_DIFF*/
		};
	});
