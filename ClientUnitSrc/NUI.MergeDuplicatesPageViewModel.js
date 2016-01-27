define("MergeDuplicatesPageViewModel", ["ext-base", "terrasoft", "sandbox", "MergeDuplicatesPageViewModelResources",
	"Account", "Contact", "LookupUtilities", "BaseFiltersGenerateModule"],
		function(Ext, Terrasoft, sandbox, resources, Account, Contact, LookupUtilities, BaseFiltersGenerateModule) {
			function generate(parentSandbox, entitySchemaName) {
				sandbox = parentSandbox;
				var entitySchema = (entitySchemaName === "Account") ? Account : Contact;
				var viewModelConfig = {
					columns: entitySchema.columns,
					entitySchema: entitySchema,
					values: {
						isViewGroup: "Changed",
						isViewChanged: true,
						isViewAll: false,
						isEdit: true,
						valuesCollection: [],
						viewDetailCommunication: true,
						viewDetailAddress: true
					},
					methods: {
						init: init,
						load: load,
						loadDetails: loadDetails,
						onLoadCollection: onLoadCollection,
						controlDisplayChange: controlDisplayChange,
						renderValueVariants: renderValueVariants,
						onAcceptClick: onAcceptClick,
						onCancelClick: onCancelClick,
						indexObjectOf: indexObjectOf,
						loadVocabulary: loadVocabulary
					}
				};
				var silenceColumns = ["Id", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "ProcessListeners"];
				var entitySilenceColumns = [];
				if (entitySchemaName === "Account") {
					entitySilenceColumns = ["Phone", "AdditionalPhone", "Fax", "Web", "AddressType", "Address", "City",
						"Region", "Zip", "Country", "Logo", "Notes"];
				} else {
					entitySilenceColumns = ["BirthDate", "Phone", "MobilePhone", "HomePhone", "Skype", "Email", "Facebook",
						"LinkedIn", "Twitter", "FacebookId", "LinkedInId", "TwitterId", "ContactPhoto", "TwitterAFDA",
						"FacebookAFDA", "LinkedInAFDA", "Photo", "AddressType", "Address",
						"Country", "Region", "City", "Zip", "Notes", "DoNotUseCall", "DoNotUseEmail", "DoNotUseFax",
						"DoNotUseMail", "DoNotUseSms"];
				}
				var primaryDisplayColumnName = viewModelConfig.entitySchema.primaryDisplayColumnName;
				silenceColumns = silenceColumns.concat(entitySilenceColumns);
				viewModelConfig.values.entityColumns = [];
				Terrasoft.each(viewModelConfig.entitySchema.columns, function(column, name) {
					if (silenceColumns.indexOf(name) < 0) {
						if (primaryDisplayColumnName !== name) {
							viewModelConfig.values.entityColumns.push(name);
						}
						viewModelConfig.values[name] = null;
						viewModelConfig.values[name + "BoxEnabled"] = true;
					}
				}, this);
				viewModelConfig.values.entityColumns.sort();
				viewModelConfig.values.entityColumns.unshift(primaryDisplayColumnName);
				return viewModelConfig;
			}

			function init() {
				this.ajaxProvider = Terrasoft.AjaxProvider;
				var entityColumns = this.get("entityColumns");
				Terrasoft.each(entityColumns, function(columnName) {
					this.set(columnName, null);
				}, this);
				this.on("change:Job", function(model, value) {
					if (value) {
						this.set("JobTitle", value.displayValue);
						this.set("JobTitle" + "BoxEnabled", true);
					} else {
						this.set("JobTitle" + "BoxEnabled", false);
					}
				}, this);
			}

			function onAcceptClick() {
				if (!this.validate()) {
					return;
				}
				this.set("isEdit", false);
				var primaryId = this.list[0];
				var entityColumns = this.get("entityColumns");
				var update = Ext.create("Terrasoft.UpdateQuery", {
					rootSchemaName: this.entitySchema.name
				});
				Terrasoft.each(entityColumns, function(columnName) {
					var column = this.entitySchema.getColumnByName(columnName);
					var value = this.get(columnName);
					if (value) {
						if (column.isLookup) {
							update.setParameterValue(columnName, value.value, Terrasoft.DataValueType.GUID);
						} else {
							update.setParameterValue(columnName, value, column.dataValueType);
						}
					}
				}, this);
				update.enablePrimaryColumnFilter(primaryId);
				var list = this.list.slice(0);
				list.shift();
				var dataSend = {
					id: this.list[0],
					duplicates: list,
					communication: [],
					address: []
				};
				var communicationDetailItem = this.detailsInfo[0];
				if (communicationDetailItem.InstanceId) {
					var detail = sandbox.publish("RequestDetailItems", [], [communicationDetailItem.InstanceId]);
					if (detail && detail.collection && detail.collection.length > 0) {
						var communicationCollection = [];
						Terrasoft.each(detail.collection, function(item) {
							var toDelete = item.get("toDelete") || false;
							if (!toDelete) {
								communicationCollection.push({
									Id: item.get("Id"),
									CommunicationTypeId: item.get("CommunicationType").value,
									Number: item.get("Number"),
									SocialMediaId: item.get("SocialMediaId")
								});
							}
						}, this);
						dataSend.communication = communicationCollection;
					}
				}

				var addressDetailItem = this.detailsInfo[1];
				if (addressDetailItem.InstanceId) {
					var _detail = sandbox.publish("RequestDetailItems", [], [addressDetailItem.InstanceId]);
					if (_detail && _detail.collection && _detail.collection.length > 0) {
						var addressCollection = [];
						Terrasoft.each(_detail.collection, function(item) {
							var toDelete = item.get("toDelete") || false;
							if (!toDelete) {
								var emptyGuid = Terrasoft.GUID_EMPTY;
								var addressType = item.get("AddressType");
								var country = item.get("Country");
								var region = item.get("Region");
								var city = item.get("City");
								addressCollection.push({
									Id: item.get("Id"),
									AddressTypeId: addressType ? addressType.value : emptyGuid,
									CountryId: country ? country.value : emptyGuid,
									RegionId: region ? region.value : emptyGuid,
									CityId: city ? city.value : emptyGuid,
									Address: item.get("Address"),
									Zip: item.get("Zip")
								});
							}
						}, this);
						dataSend.address = addressCollection;
					}
				}

				update.execute(function(response) {
					if (response.success) {
						callServiceMethod.call(this, "Merge" + this.entitySchema.name + "Duplicates", function(responce) {
							var result = responce["Merge" + this.entitySchema.name + "DuplicatesResult"];
							this.set("isEdit", true);
							this.onCancelClick();
						}, dataSend);
					}
				}, this);
			}

			function onCancelClick() {
				sandbox.publish("BackHistoryState");
			}

			function load(list) {
				this.list = list;
				var entitySchema = this.entitySchema;
				this.set(entitySchema.primaryColumnName, list[0]);
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: entitySchema.name
				});
				var entityColumns = this.get("entityColumns");
				Terrasoft.each(entityColumns, function(columnName) {
					esq.addColumn(columnName);
				}, this);
				var filter = Terrasoft.createColumnInFilterWithParameters(entitySchema.primaryColumnName, list);
				esq.filters.addItem(filter);
				esq.getEntityCollection(this.onLoadCollection, this);

			}

			function onLoadCollection(responce) {
				if (responce.success) {
					var items = responce.collection.getItems();
					var valuesCollection = [];
					var countItems = items.length;
					var entityColumns = this.get("entityColumns");
					for (var i = 0; i < countItems; i++) {
						var values = items[i].values;
						Terrasoft.each(entityColumns, function(columnName) {
							var collection = valuesCollection[columnName] || [];
							var value = values[columnName];
							if (!Ext.isEmpty(value) && indexObjectOf(collection, value) < 0) {
								collection.push(value);
							}
							valuesCollection[columnName] = collection;
						}, this);
					}
					this.set("valuesCollection", valuesCollection);
					renderValueVariants.call(this);
					controlDisplayChange.call(this);
					loadDetails.call(this);
				}
			}

			function loadDetails() {
				if (this.detailsInfo) {
					Terrasoft.each(this.detailsInfo, function(item) {
						loadDetailModule.call(this, item);
					}, this);
					return;
				}
				var entitySchemaName = this.entitySchema.name;

				this.detailsInfo = [
					{
						filterPath: entitySchemaName,
						filterValuePath: "Id",
						schemaName: "CommunicationDetail",
						name: "communication"
					},
					{
						filterPath: entitySchemaName,
						filterValuePath: "Id",
						schemaName: "AddressDetail",
						name: "address"
					}
				];
				var communicationDetailLoad = function onCommunicationDetailLoad(responce) {
					var detailItem = this.detailsInfo[0];
					Terrasoft.each(responce.collection.collection.items, function(item) {
						item.set("Id", Terrasoft.generateGUID());
						item.set(entitySchemaName, {value: this.list[0], displayValue: ""});
						item.primaryColumnName = "Id";
					}, this);
					detailItem.items = responce.collection.getItems();
					loadDetailModule.call(this, detailItem);
				};
				var addressDetailLoad = function onAddressDetailLoad(responce) {
					var detailItem = this.detailsInfo[1];
					Terrasoft.each(responce.collection.collection.items, function(item) {
						item.set("Id", Terrasoft.generateGUID());
						item.set(entitySchemaName, {value: this.list[0], displayValue: ""});
						item.primaryColumnName = "Id";
					}, this);
					detailItem.items = responce.collection.getItems();
					loadDetailModule.call(this, detailItem);
				};
				var commEsq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: entitySchemaName + "Communication"
				});
				commEsq.isDistinct = true;
				commEsq.addColumn("CommunicationType");
				commEsq.addColumn("Number");
				commEsq.addColumn("SocialMediaId");
				commEsq.rowCount = 1000;
				commEsq.filters.addItem(Terrasoft.createColumnInFilterWithParameters(entitySchemaName, this.list));

				commEsq.getEntityCollection(communicationDetailLoad, this);

				var addressEsq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: entitySchemaName + "Address"
				});
				addressEsq.isDistinct = true;
				addressEsq.addColumn("AddressType");
				addressEsq.addColumn("Country");
				addressEsq.addColumn("Region");
				addressEsq.addColumn("City");
				addressEsq.addColumn("Address");
				addressEsq.addColumn("Zip");
				addressEsq.rowCount = 1000;
				addressEsq.filters.addItem(Terrasoft.createColumnInFilterWithParameters(entitySchemaName, this.list));

				addressEsq.getEntityCollection(addressDetailLoad, this);



				function loadDetailModule(detailItem) {
					var detailInstanceId = detailItem.InstanceId = sandbox.id + "_" + this.entitySchema.name + "_detail_" +
							detailItem.name;
					var detailContainer = Ext.get(detailItem.name + "GroupContainer");
					sandbox.loadModule("DetailModule", {
						renderTo: detailContainer,
						id: detailInstanceId
					});
				}

				var scope = this;

				function scopeFunction(responce) {
					handler.apply(scope, arguments);
				}

				function handler(detailId) {
					Terrasoft.each(this.detailsInfo, function(item) {
						if (item.InstanceId === detailId) {
							var args = {
								Id: detailId,
								schemaName: item.schemaName,
								filterPath: item.filterPath,
								filterValue: this.get(this.entitySchema.primaryColumnName),
								parentChemaName: this.entitySchema.name,
								operationType: "edit",
								predefinedRecords: item.items,
								container: item.name + "GroupContainer",
								blockBaseLoad: true
							};
							sandbox.publish("LoadData", args);
						}
					}, this);
				}

				sandbox.subscribe("DetailInfo", scopeFunction);
			}

			function indexObjectOf(collection, obj) {
				if (!Ext.isObject(obj)) {
					return collection.indexOf(obj);
				}
				var existIndex = -1;
				Terrasoft.each(collection, function(item, index) {
					if (item.value === obj.value && item.displayValue === obj.displayValue) {
						existIndex = index;
					}
				}, this);
				return existIndex;
			}

			function renderValueVariants() {
				var containerViewCollection = this.get("containerViewCollection") || [];
				if (containerViewCollection.length <= 0) {
					var valuesCollection = this.get("valuesCollection");
					var entityColumns = this.get("entityColumns");
					Terrasoft.each(entityColumns, function(columnName) {
						var collection = valuesCollection[columnName] || [];
						var collectionLength = collection.length;
						this.set(columnName, collection[0]);
						if (collection.length > 1) {
							var radioGroupName = columnName + "RadioGroup";
							this.set(radioGroupName, 0);
							this.on("change:" + radioGroupName, function(model, tag) {
								var values = this.get("valuesCollection");
								this.set(columnName, values[columnName][tag]);
							});
							var renderToName = "attribute" + columnName + "RightContainer";
							for (var i = 0; i < collectionLength; i++) {
								var item = collection[i];
								var value = item.displayValue || item;
								var config = {
									className: "Terrasoft.Container",
									id: "attribute" + columnName + "Right" + i + "Container",
									selectors: {
										wrapEl: "#attribute" + columnName + "Right" + i + "Container"
									},
									classes: {
										wrapClassName: "rightItemContainer"
									},
									items: [
										{
											className: "Terrasoft.TextEdit",
											enabled: false,
											classes: {
												wrapClass: "controlBaseedit"
											},
											value: value
										},
										{
											className: "Terrasoft.RadioButton",
											tag: i,
											checked: {
												bindTo: columnName + "RadioGroup"
											}
										}
									]
								};
								containerViewCollection.push({
									config: config,
									renderToName: renderToName
								});
							}
						}
					}, this);
					this.set("containerViewCollection", containerViewCollection);
				}
				Terrasoft.each(containerViewCollection, function(args) {
					var cloneConfig = Terrasoft.deepClone(args.config);
					var renderTo = Ext.get(args.renderToName);
					var containerView = Ext.create("Terrasoft.Container", cloneConfig);
					containerView.bind(this);
					containerView.render(renderTo);
				}, this);
			}

			function controlDisplayChange() {
				var valuesCollection = this.get("valuesCollection");
				var entityColumns = this.get("entityColumns");
				var isViewChanged = this.get("isViewChanged") || false;
				Terrasoft.each(entityColumns, function(columnName) {
					var collection = valuesCollection[columnName] || [];
					if (isViewChanged) {
						if (collection.length < 2) {
							this.set(columnName + "BoxEnabled", false);
						}
					} else {
						this.set(columnName + "BoxEnabled", true);
					}
				}, this);
			}

			function loadVocabulary(args, columnName) {
				var column = this.entitySchema.getColumnByName(columnName);
				Terrasoft.each(this.detailsInfo, function(item) {
					var detail = sandbox.publish("RequestDetailItems", null, [item.InstanceId]);
					if (detail && detail.collection) {
						item.items = detail.collection;
					}
				}, this);

				var config = {
					entitySchemaName: column.referenceSchemaName,
					multiSelect: false,
					columnName: columnName,
					searchValue: args.searchValue
				};
				if (columnName === "Owner") {
					config.filters = BaseFiltersGenerateModule.OwnerFilter();
				}

				var handler = function(args) {
					var items = args.selectedRows.getItems() || [];
					if (items.length > 0) {
						this.set(args.columnName, items[0]);
					}
				};
				LookupUtilities.Open(sandbox, config, handler, this, this.renderTo);
			}

			function callServiceMethod(methodName, callback, dataSend) {
				var data = dataSend || {};
				var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/SearchDuplicatesService/" + methodName;
				var request = this.ajaxProvider.request({
					url: requestUrl,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					method: "POST",
					jsonData: data,
					callback: function(request, success, response) {
						var responseObject = {};
						if (success) {
							responseObject = Terrasoft.decode(response.responseText);
						}
						callback.call(this, responseObject);
					},
					scope: this
				});
				return request;
			}

			return {
				generate: generate
			};
		});