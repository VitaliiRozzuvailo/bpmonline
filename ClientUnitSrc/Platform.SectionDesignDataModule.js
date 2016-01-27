define("SectionDesignDataModule", ["ext-base", "terrasoft", "SectionDesignerEnums", "SectionDesignerUtils",
		"SectionDesignDataModuleResources", "SchemaBuilderV2", "ModalBox"],
	function(Ext, Terrasoft, SectionDesignerEnums, SectionDesignerUtils, resources, SchemaBuilder, ModalBox) {

		/**
		 * Объект sandbox
		 * @private
		 * @type {Object}
		 */
		var sandbox = null;

		/**
		 * Локализированные строки ресурсов
		 * @private
		 * @type {Object}
		 */
		var localizableStrings = resources.localizableStrings;

		var utils = {

			/**
			 * Применяет изменения к entity схеме
			 * @private
			 * @param {Object} schema объект схемы
			 * @return {Terrasoft.BaseEntitySchema} Схема с изменениями
			 */
			mergeEntitySchema: function(schema) {
				var entitySchema = Ext.merge({}, schema.schema);
				var entitySchemaColumns = entitySchema.columns;
				if (schema.metaInfo.modifiedData) {
					var modifiedData = Terrasoft.deepClone(schema.metaInfo.modifiedData);
					var modifiedColumns = modifiedData.columns;
					if (modifiedColumns) {
						Terrasoft.each(entitySchemaColumns, function(column, columnName) {
							var columnId = column.uId;
							var modifiedColumn = modifiedColumns[columnId];
							if (modifiedColumn) {
								if (modifiedColumn.name !== column.name) {
									entitySchemaColumns[modifiedColumn.name] = modifiedColumn;
									delete entitySchemaColumns[columnName];
								} else {
									Ext.apply(column, modifiedColumn);
								}
								delete modifiedColumns[columnId];
							}
						}, this);
						Terrasoft.each(modifiedColumns, function(column) {
							entitySchemaColumns[column.name] = column;
						}, this);
						delete modifiedData.columns;
					}
					Ext.apply(entitySchema, modifiedData);
				}
				return entitySchema;
			},

			/**
			 * Получает изначальную клиентскую схему
			 * @private
			 * @param {String} schema объект схемы
			 * @returns {Object} Схема без изменений
			 */
			getClientUnitOriginSchema: function(schema) {
				var clientUnitSchema = Terrasoft.deepClone(schema.schema.originData);
				var clientUnitStructureSchema = Terrasoft.deepClone(schema.structure.originData);
				var clientUnitResourcesSchema = Terrasoft.deepClone(schema.resources.originData);
				return {
					schema: clientUnitSchema,
					structure: clientUnitStructureSchema,
					resources: clientUnitResourcesSchema
				};
			},

			/**
			 * Применяет изменения к clientUnit схеме
			 * @private
			 * @param {Object} schemaData объект с данными схемы
			 * @return {Object} Схема с изменениями
			 */
			mergeClientUnitSchema: function(schemaData) {
				var clientUnitSchema = Terrasoft.deepClone(schemaData.schema.originData);
				var clientUnitStructureSchema = Terrasoft.deepClone(schemaData.structure.originData);
				var clientUnitResourcesSchema = Terrasoft.deepClone(schemaData.resources.originData);
				if (!Terrasoft.isEmptyObject(schemaData.schema.metaInfo.modifiedData)) {
					clientUnitSchema = Terrasoft.deepClone(schemaData.schema.metaInfo.modifiedData);
				}
				if (schemaData.structure.metaInfo.modifiedData) {
					var modifiedStructureData = Terrasoft.deepClone(schemaData.structure.metaInfo.modifiedData);
					Ext.merge(clientUnitStructureSchema, modifiedStructureData);
				}
				if (schemaData.resources.metaInfo.modifiedData) {
					var modifiedResourcesData = Terrasoft.deepClone(schemaData.resources.metaInfo.modifiedData);
					Ext.merge(clientUnitResourcesSchema, modifiedResourcesData);
				}
				return {
					schema: clientUnitSchema,
					structure: clientUnitStructureSchema,
					resources: clientUnitResourcesSchema
				};
			},

			/**
			 * Возвращает массив данных схемы
			 * @private
			 * @param {Object} entity Объект данных
			 * @param {Object} dataMetaInfo Объект мета данных
			 * @param {Boolean} isOriginal Название entity схемы
			 * @return {Object} Данные схемы с изменениями
			 */
			mergeEntity: function(entity, dataMetaInfo, isOriginal) {
				var result = entity;
				if (isOriginal) {
					if (dataMetaInfo && dataMetaInfo.modificationType ===
						SectionDesignerEnums.ModificationType.NEW) {
						result = null;
					} else {
						delete result.metaInfo;
					}
				} else {
					if (dataMetaInfo) {
						switch (dataMetaInfo.modificationType) {
							case SectionDesignerEnums.ModificationType.NEW:
								result = dataMetaInfo.modifiedData;
								break;
							case SectionDesignerEnums.ModificationType.MODIFIED:
								delete result.metaInfo;
								result = Ext.apply(entity, dataMetaInfo.modifiedData);
								break;
							case SectionDesignerEnums.ModificationType.DELETED:
								result = null;
								break;
							default:
								break;
						}
					}
				}
				return result;
			},

			/**
			 * Возвращает массив данных схемы
			 * @private
			 * @param {String} schemaName Название entity схемы
			 * @param {Boolean} isOriginal Название entity схемы
			 * @return {Object[]} Данные схемы с изменениями
			 */
			getEntitySchemaData: function(schemaName, isOriginal) {
				var data = designData.data[schemaName];
				var result = [];
				if (data) {
					for (var i = 0, dataLength = data.length; i < dataLength; i++) {
						var entity = Terrasoft.deepClone(data[i]);
						var dataMetaInfo = data[i].metaInfo;
						entity = utils.mergeEntity(entity, dataMetaInfo, isOriginal);
						if (entity) {
							result.push(entity);
						}
					}
				}
				return result;
			},

			/**
			 * Возвращает запись схемы по идентификатору
			 * @private
			 * @param {String} schemaName Название entity схемы
			 * @param {Boolean} isOriginal Название entity схемы
			 * @param {String} entityId Идентификатор схемы
			 * @return {Object} Запись схемы по идентификатору
			 */
			getEntitySchemaDataById: function(schemaName, isOriginal, entityId) {
				var data = designData.data[schemaName];
				var entity;
				if (data) {
					entity = Terrasoft.deepClone(this.getInnerEntityById(schemaName, entityId));
					if (entity) {
						var dataMetaInfo = entity.metaInfo;
						entity = utils.mergeEntity(entity, dataMetaInfo, isOriginal);
					}
				}
				return entity;
			},

			/**
			 * Возвращает запись c с метаданными схемы по идентификатору
			 * @private
			 * @param {String} schemaName Название entity схемы
			 * @param {String} entityId Идентификатор схемы
			 * @return {Object} Запись схемы по идентификатору
			 */
			getInnerEntityById: function(schemaName, entityId) {
				var data = designData.data[schemaName];
				var entity;
				if (data) {
					for (var i = 0, dataLength = data.length; i < dataLength; i++) {
						if (data[i].Id === entityId) {
							entity = data[i];
						}
					}
				}
				return entity;
			},

			/**
			 * Устанавливает данные в designData
			 * @private
			 * @param {String} schemaName Название entity схемы
			 * @param {Object[]} data Массив данных схемы
			 */
			setData: function(schemaName, data) {
				var designDataObject = {
					data: {}
				};
				designDataObject.data[schemaName] = data;
				setDesignData(designDataObject);
			},

			/**
			 * Возвращает имя схемы из design data по идентификатору схемы
			 * @private
			 * @param {String} id идентификатор схемы
			 * @param {Boolean} isClientUnit признак того, что схема является клиентским модулем
			 */
			getSchemaNameById: function(id, isClientUnit) {
				var name;
				var schemaManager = designData.schemaManager;
				var schemaBranch = (isClientUnit) ? schemaManager.clientUnit : schemaManager.entity;
				Terrasoft.each(schemaBranch, function(schema) {
					if (schema.schemaUId === id) {
						name = schema.schemaName;
						return;
					}
				});
				return name;
			},

			/**
			 * Возвращает объект схемы в callback
			 * @private
			 * @param {Object} config объект параметров:
			 * @param {String} config.id идентификатор схемы,
			 * @param {String} config.name название схемы,
			 * @param {Function} config.callback функция обратного вызова,
			 * @param {Object} config.scope контекст выполнения функциии обратного вызова
			 * @param {Boolean} config.isOriginal признак возвращения изначальной схемы без изменений,
			 * @param {Boolean} config.isClientUnit признак того, что схема является клиентским модулем
			 */
			getSchema: function(config) {
				var id,
					name,
					callback,
					scope,
					isOriginal,
					isClientUnit;
				id = config.id;
				name = (id) ? utils.getSchemaNameById(id) : config.name;
				callback = config.callback;
				isOriginal = config.isOriginal;
				scope = config.scope || this;
				isClientUnit = config.isClientUnit;
				var schemaManager = designData.schemaManager;
				var entityBranch = (!isClientUnit) ? schemaManager.entity : schemaManager.clientUnit;
				var schema = entityBranch[name];
				if (name && schema) {
					if (isOriginal) {
						if (isClientUnit) {
							utils.getClientUnitOriginSchema(schema);
						} else {
							callback.call(scope, schema.schema);
						}
					} else {
						var mergeSchemaMethodName = (!isClientUnit) ? "mergeEntitySchema" : "mergeClientUnitSchema";
						callback.call(scope, utils[mergeSchemaMethodName](schema));
					}
				} else {
					var schemaConfig = {
						callback: function(schemaInfo) {
							if (!schemaInfo) {
								callback.call(scope, null);
							} else {
								var schemaName = schemaInfo.name;
								var config = {
									schemaNames: [schemaName]
								};
								if (!isClientUnit) {
									config.callback = function(schemaDesignData) {
										modifyEntitySchemaDesignData(schemaName, schemaDesignData.entity[schemaName]);
										getEntitySchemaByName({
											name: schemaName,
											callback: callback,
											isOriginal: isOriginal,
											scope: scope
										});
									};
								} else {
									config.callback = function() {
										getClientUnitSchemaByName({
											name: schemaName,
											callback: callback,
											isOriginal: isOriginal,
											scope: scope
										});
									};
									config.isClientUnit = isClientUnit;
								}
								loadSchema(config);
							}
						},
						scope: this,
						isClientUnit: isClientUnit
					};
					if (id) {
						schemaConfig.schemaId = id;
					} else {
						schemaConfig.schemaName = name;
					}
					SectionDesignerUtils.getSchemaInfo(schemaConfig);
				}
			},

			/**
			 * Возвращает подготовленные данные entity схем
			 * @private
			 * @param {String[]} schemaNameSequence Порядок загрузки
			 * @return {Object[]} Подготовленные данные entity схем
			 */
			getEntitySchemaPostData: function(schemaNameSequence) {
				var schemaManager = Terrasoft.deepClone(designData.schemaManager);
				var entities = schemaManager.entity;
				var result = [];
				for (var i = 0, entitiesCount = schemaNameSequence.length; i < entitiesCount; i++) {
					var schemaName = schemaNameSequence[i];
					var schemaInfo = entities[schemaName];
					if (schemaInfo) {
						var schemaMetaInfo = schemaInfo.metaInfo;
						var modifiedData = schemaMetaInfo.modifiedData;
						if (modifiedData) {
							var canPostSchema = this.getIsSchemaChanged(schemaMetaInfo);
							if (canPostSchema) {
								var schema = schemaInfo.schema;
								if (!Ext.Object.isEmpty(schema)) {
									modifiedData.uId = schema.uId;
									modifiedData.name = schema.name;
									modifiedData.caption = schema.caption;
									modifiedData.administratedByRecords = schema.administratedByRecords;
									result.push(schemaMetaInfo);
								}
							}
						}
					}
				}
				return result;
			},

			/**
			 * Определяет, была ли схема изменена
			 * @param schemaMetaInfo мета информация схемы
			 * @returns {boolean}
			 */
			getIsSchemaChanged: function(schemaMetaInfo) {
				var modifiedData = Terrasoft.deepClone(schemaMetaInfo.modifiedData);
				var modifiedDataColumns = modifiedData.columns;
				delete modifiedData.columns;
				return !Ext.Object.isEmpty(modifiedData) || !Ext.Object.isEmpty(modifiedDataColumns);
			},

			/**
			 * Обновляет существующие свойства объекта
			 * @private
			 * @param {Object} destinationObject Объект который нужно обновить
			 * @param {Object} modifiedDataObject Объект с изменененными свойствами
			 * @param {Object} originDataObject Объект с изначальнимы свойствами
			 * @return {Object} Объект с обновленными свойствами
			 */
			mergeExistingProperties: function(destinationObject, modifiedDataObject, originDataObject) {
				var result = {};
				Terrasoft.each(destinationObject, function(propertyValue, propertyName) {
					var destinationObjectPropertyValue = destinationObject[propertyName];
					if (Ext.isObject(destinationObjectPropertyValue)) {
						result[propertyName] = modifiedDataObject[propertyName] || {};
					} else if (Ext.isArray(destinationObjectPropertyValue)) {
						result[propertyName] = modifiedDataObject[propertyName] || [];
					} else {
						result[propertyName] = modifiedDataObject[propertyName] || originDataObject[propertyName];
					}
				}, this);
				return result;
			},

			/**
			 * Возвращает объект из разницы и деталей тела функции
			 * @private
			 * @param {Object} schemaStructure Post-данные схем
			 * @param {String} entitySchemaName Название entity схемы
			 * @param {Function} callback Функция обратного вызова
			 * @param {Object} scope Контекст выполнения функции обратного вызова
			 */
			getClientUnitSchemaModifiedBodyData: function(schemaPostDataItem, entitySchemaName, callback, scope) {
				var schemaStructure = schemaPostDataItem.structure;
				var parentSchemaName = schemaStructure.parentSchemaName;
				Terrasoft.chain({
					scope: this,
					schemaPackageStatus: SectionDesignerEnums.SchemaPackageStatus.NOT_EXISTS
				}, [
					function(context) {
						var schemaName = schemaStructure.schemaName;
						SectionDesignerUtils.getSchemaPackageStatus(schemaName, function(schemaStatus) {
							context.schemaPackageStatus = schemaStatus;
							if (schemaStatus === SectionDesignerEnums.SchemaPackageStatus.NOT_EXISTS_IN_CURRENT_PACKAGE) {
								parentSchemaName = schemaName;
								schemaPostDataItem.schema.diff = [];
							}
							context.next();
						}, this);
					},
					function(context) {
						var buildConfig = {
							schemaName: parentSchemaName,
							useCache: false
						};
						if (context.schemaPackageStatus !== SectionDesignerEnums.SchemaPackageStatus.NOT_EXISTS) {
							buildConfig.entitySchemaName = entitySchemaName;
						}
						SchemaBuilder.build(buildConfig, function(viewModelClass, view, schema) {
							context.parentSchema = schema || {};
							context.next();
						}, this);
					},
					function(context) {
						var schema = schemaPostDataItem.schema;
						var schemaViewConfig = schema.viewConfig;
						var schemaDetails = schema.details || {};
						var schemaDiff = schema.diff;
						var parentSchema = context.parentSchema;
						var parentSchemaViewConfig = parentSchema.viewConfig || [];
						var diff = (schemaViewConfig.length === 0)
							? schemaDiff
							: Terrasoft.JsonDiffer.getJsonDiff(parentSchemaViewConfig, schemaViewConfig);
						var result = {
							diff: JSON.stringify(diff, null, "\t"),
							details: JSON.stringify(schemaDetails, null, "\t"),
							schemaPackageStatus: context.schemaPackageStatus
						};
						callback.call(scope, result);
					}
				]);
			},

			/**
			 * Выполняет обновление тела схемы
			 * @private
			 * @param {Object[]} schemaPostData Post-данные схем
			 * @param {Function} callback Функция обратного вызова
			 * @param {Object} scope Контекст выполнения функции обратного вызова
			 * @param {Number} index Индекс текущего элемента post-данных схемы
			 */
			updateSchemaBody: function(schemaPostData, callback, scope, index) {
				index = index || 0;
				if (index === schemaPostData.length) {
					callback.call(scope, schemaPostData);
				} else {
					var schemaPostDataItem = schemaPostData[index].modifiedData;
					var schemaStructure = schemaPostDataItem.structure;
					Terrasoft.chain({
						schemaPostDataItem: schemaPostDataItem,
						schemaStructure: schemaStructure,
						entitySchemaName: schemaPostDataItem.entitySchemaName,
						schemaName: schemaStructure.schemaName,
						schemaType: schemaStructure.type,
						scope: this
					}, [
						function(context) {
							scope.getClientUnitSchemaModifiedBodyData(
								context.schemaPostDataItem,
								context.entitySchemaName,
								function(clientUnitSchemaModifiedData) {
									context.clientUnitSchemaModifiedData = clientUnitSchemaModifiedData;
									context.next();
								},
								this
							);
						},
						function(context) {
							SectionDesignerUtils.getSchemaBody(
								context.schemaName,
								context.schemaType,
								context.entitySchemaName,
								context.clientUnitSchemaModifiedData.schemaPackageStatus,
								function(body) {
									var clientUnitSchemaModifiedData = context.clientUnitSchemaModifiedData;
									var diff = Ext.String.format("$1{0}$3", clientUnitSchemaModifiedData.diff);
									var details = Ext.String.format("$1{0}$3", clientUnitSchemaModifiedData.details);
									body = body.replace(/(\/\*\*SCHEMA_DIFF\*\/)([\s\S]*)(\/\*\*SCHEMA_DIFF\*\/)/gmi, diff);
									body = body.replace(/(\/\*\*SCHEMA_DETAILS\*\/)([\s\S]*)(\/\*\*SCHEMA_DETAILS\*\/)/gmi,
										details);
									schemaPostData[index].modifiedData.body = body;
									context.next();
								},
								this
							);
						},
						function(context) {
							context.scope.updateSchemaBody(schemaPostData, callback, scope, index + 1);
						}
					]);
				}
			},

			/**
			 * Возвращает подготовленные данные клиентских схем
			 * @private
			 * @param {Function} Функция обратного вызова
			 * @return {Object[]} Подготовленные данные клиентских схем
			 */
			getClientUnitSchemaPostData: function(callback, scope) {
				var schemaManager = Terrasoft.deepClone(designData.schemaManager);
				var clientUnits = schemaManager.clientUnit;
				var clientUnitSchemaPostData = [];
				Terrasoft.each(clientUnits, function(schemaInfo) {
					var modificationType = schemaInfo.structure.metaInfo.modificationType;
					if (this.isClientUnitSchemaModified(modificationType, schemaInfo)) {
						var clientUnitPostDataItem = {
							resources: {
								localizableStrings: {}
							},
							structure: {
								extendParent: null,
								parentSchemaUId: null,
								parentSchemaName: null,
								schemaCaption: null,
								schemaName: null,
								schemaUId: null,
								type: null
							}
						};
						Terrasoft.each(clientUnitPostDataItem, function(property, propertyName) {
							var originData = schemaInfo[propertyName].originData;
							var modifiedData = schemaInfo[propertyName].metaInfo.modifiedData;
							clientUnitPostDataItem[propertyName] = this.mergeExistingProperties(property, modifiedData,
								originData);
						}, this);
						Terrasoft.each(designData.module, function(sectionInfo) {
							clientUnitPostDataItem.entitySchemaName = sectionInfo.entityName;
						}, this);
						clientUnitPostDataItem.schema = {};
						var schema = schemaInfo.schema;
						var schemaModifiedData = schema.metaInfo.modifiedData;
						var primaryDetails = schema.originData.details;
						var modifiedDetails = schemaModifiedData.details;
						if (primaryDetails) {
							clientUnitPostDataItem.schema.details = modifiedDetails || primaryDetails;
						}
						var primaryDiff = schema.originData.diff;
						var modifiedDiff = schemaModifiedData.diff;
						clientUnitPostDataItem.schema.diff = modifiedDiff || primaryDiff || [];
						clientUnitPostDataItem.schema.viewConfig = schemaModifiedData.viewConfig || [];
						if (clientUnitPostDataItem.structure.schemaName) {
							clientUnitSchemaPostData.push({modifiedData: clientUnitPostDataItem});
						}

					}
				}, this);
				this.updateSchemaBody(clientUnitSchemaPostData, function(clientUnitSchemaPostData) {
					callback.call(scope, clientUnitSchemaPostData);
				}, this);
			},

			/**
			 * Проверяет изменилась ли схема
			 * @private
			 * @param {SectionDesignerEnums.ModificationType} modificationType Тип изменения
			 * @param {Object} schemaInfo Данные дизайнера пользовательской схемы
			 * @return {Boolean} Результат проверки
			 */
			isClientUnitSchemaModified: function(modificationType, schemaInfo) {
				var result = false;
				if (modificationType === SectionDesignerEnums.ModificationType.NEW) {
					result = true;
				} else {
					var schema = schemaInfo.schema.metaInfo.modifiedData;
					var structure = schemaInfo.structure.metaInfo.modifiedData;
					var resources = schemaInfo.resources.metaInfo.modifiedData;
					var localizableStrings = resources.localizableStrings;
					result = !(Ext.Object.isEmpty(schema) && Ext.Object.isEmpty(structure) &&
					Ext.Object.isEmpty(resources) && Ext.Object.isEmpty(localizableStrings));
				}
				return result;
			},

			/**
			 * Возвращает подготовленные данные настроек грида
			 * @private
			 * @return {Object} Подготовленные данные настроек грида
			 */
			getGridSettingPostData: function() {
				var result;
				var gridSettingsModifiedData = Terrasoft.deepClone(designData.gridSettings.modifiedData);
				if (!Ext.Object.isEmpty(gridSettingsModifiedData)) {
					result = {
						key: gridSettingsModifiedData.key,
						data: Terrasoft.encode(gridSettingsModifiedData),
						isDef: !designData.gridSettings.originalData.DataGrid
					};
				}
				return result;
			},

			/**
			 * Возвращает сериализированный объект данных дизайнера
			 * @private
			 * @param {Function} callback Функция обратного вызова
			 * @return {String} Cериализированный объект данных дизайнера
			 */
			getPostDesignData: function(callback) {
				var schemaNameSequence = [];
				var moduleCode = designData.mainModuleName;
				var workplaceId = designData.workplaceId;
				var sectionData = designData.module[moduleCode];
				var sectionId = sectionData.id;
				var packageUId = storage.getItem("SectionDesigner_CurrentPackageUId");
				Terrasoft.chain({}, [
					function(context) {
						if (workplaceId) {
							addEntity("SysModuleInWorkplace", {
								"SysWorkplace": workplaceId.value,
								"SysModule": sectionId
							});
						}
						var innerEntity = utils.getInnerEntityById("SysModule", sectionData.id);
						if (innerEntity.metaInfo &&
							innerEntity.metaInfo.modificationType !== SectionDesignerEnums.ModificationType.NEW) {
							getEntityById("SysModule", sectionId, ["Image32", "Logo"], true, function(data) {
								data = data || {};
								context.currentImageId = sectionData.sectionIconId;
								context.existingImageId = data.Image32;
								context.currentLogoId = sectionData.sectionLogoId;
								context.existingLogoId = data.Logo;
								context.next();
							});
						} else {
							getEntityById("SysModule", sectionId, ["Image32", "Logo"], false, function(data) {
								data = data || {};
								context.currentImageId = data.Image32;
								context.existingImageId = Terrasoft.GUID_EMPTY;
								context.currentLogoId = data.Logo;
								context.existingLogoId = Terrasoft.GUID_EMPTY;
								context.next();
							});
						}
					},
					function(context) {
						var sectionIconId = context.currentImageId;
						if (context.existingImageId !== sectionIconId) {
							getEntityById("SysImage", sectionIconId, ["ModifiedOn"], true, function() {
								modifyEntity("SysImage", {}, sectionIconId);
								context.next();
							});
						} else {
							context.next();
						}
					},
					function(context) {
						var sectionLogoId = context.currentLogoId;
						if (context.existingLogoId !== sectionLogoId) {
							getEntityById("SysImage", sectionLogoId, ["ModifiedOn"], true, function() {
								modifyEntity("SysImage", {}, sectionLogoId);
								context.next();
							});
						} else {
							context.next();
						}
					},
					function(context) {
						utils.getSchemaNameSequence(function(schemaNames) {
							schemaNameSequence = schemaNames;
							context.next();
						});
					},
					function(context) {
						utils.getClientUnitSchemaPostData(function(clientUnitPostData) {
							context.clientUnitPostData = clientUnitPostData;
							context.next();
						});
					},
					function(context) {
						var moduleCode = designData.mainModuleName;
						var moduleData = designData.module[moduleCode];
						var postDesignData = {
							data: designData.data,
							schemaManager: {
								entity: utils.getEntitySchemaPostData(schemaNameSequence),
								clientUnit: context.clientUnitPostData
							},
							gridSettings: utils.getGridSettingPostData(),
							detailGridSettings: Ext.Object.getValues(designData.detailGridSettings),
							schemaNameSequence: schemaNameSequence,
							sectionCode: moduleCode,
							sectionTypeColumnUId: moduleData.typeColumnId,
							sectionEntitySchemaName: moduleData.entityName,
							currentPackageUId: packageUId
						};
						callback(JSON.stringify(postDesignData));
					}
				]);
			},

			/**
			 * Возвращает правильную последовательность имен схем
			 * @private
			 * @param {Function} callback Функция обратного вызова
			 */
			getSchemaNameSequence: function(callback) {
				function processSchemaSequence(schemaNameIndex, columns, schemaNames) {
					var skipColumnNames = ["CreatedBy", "ModifiedBy"];
					for (var columnId in columns) {
						if (skipColumnNames.indexOf(columnId) === -1) {
							var column = columns[columnId];
							if (column.dataValueType === Terrasoft.DataValueType.LOOKUP ||
								column.dataValueType === Terrasoft.DataValueType.IMAGELOOKUP) {
								var referenceSchemaName = column.referenceSchemaName;
								var referenceSchemaNameIndex = schemaNames.indexOf(referenceSchemaName);
								if (referenceSchemaNameIndex > schemaNameIndex) {
									var element = schemaNames[referenceSchemaNameIndex];
									schemaNames.splice(referenceSchemaNameIndex, 1);
									schemaNames.unshift(element);
								}
							}
						}
					}
				}

				var data = designData.data;
				var schemaManager = designData.schemaManager;
				var entitySchemaManager = schemaManager.entity;
				var schemaNameSequence = [];
				Terrasoft.each(data, function(schemaData, schemaName) {
					if (!entitySchemaManager[schemaName]) {
						schemaNameSequence.push(schemaName);
					}
				});
				Terrasoft.chain({}, [
					function(context) {
						var config = {
							schemaNames: schemaNameSequence,
							callback: function(requiredScheme) {
								context.requiredScheme = requiredScheme;
								context.next();
							}
						};
						loadSchema(config);
					},
					function(context) {
						var designedSchemaItems = designData.schemaManager.entity;
						Terrasoft.each(designedSchemaItems, function(schemaMetaInfo, schemaName) {
							schemaNameSequence.push(schemaName);
						});
						var scheme = context.requiredScheme.entity;
						var schema, schemaName, columns, schemaNameIndex;
						for (schemaName in scheme) {
							schema = scheme[schemaName];
							columns = schema.columns;
							schemaNameIndex = schemaNameSequence.indexOf(schemaName);
							processSchemaSequence(schemaNameIndex, columns, schemaNameSequence);
						}
						for (schemaName in designedSchemaItems) {
							schema = designedSchemaItems[schemaName];
							schemaNameIndex = schemaNameSequence.indexOf(schemaName);
							var entityMetaInfo = schema.metaInfo;
							entityMetaInfo.modifiedData = entityMetaInfo.modifiedData || {};
							entityMetaInfo.modifiedData.columns = entityMetaInfo.modifiedData.columns || {};
							columns = entityMetaInfo.modifiedData.columns;
							if (columns) {
								processSchemaSequence(schemaNameIndex, columns, schemaNameSequence);
							}
						}
						callback(schemaNameSequence);
					}
				]);
			},

			/**
			 * Возвращает объект entity схем в callback найденых по имени
			 * @param {Object} config объект входящих прараметрові,
			 * @param {String[]} config.schemaNames названия схем,
			 * @param {Function} config.callback функция обратного вызова,
			 * @param {Object} config.loadedScheme загруженные схемы
			 * @param {Object} config.scope объект в контексте которого будет выполняться функция обратного вызова
			 */
			getSchemeByName: function(config) {
				var schemaNames = config.schemaNames;
				var isClientUnit = config.isClientUnit;
				var callback = config.callback;
				var loadedScheme = config.loadedScheme || {};
				var scope = config.scope || this;
				var getSchemaByNameMethod = (isClientUnit) ? getClientUnitSchemaByName : getEntitySchemaByName;
				var innerSchemaNames = Terrasoft.deepClone(schemaNames);
				var currentSchemaName = innerSchemaNames.pop();
				if (currentSchemaName) {
					var innerConfig = {
						name: currentSchemaName,
						callback: function(schema) {
							loadedScheme[currentSchemaName] = schema;
							this.getSchemeByName({
								schemaNames: innerSchemaNames,
								isClientUnit: isClientUnit,
								callback: callback,
								loadedScheme: loadedScheme,
								scope: loadedScheme
							});
						}
					};
					getSchemaByNameMethod(innerConfig);
				} else {
					callback.call(scope, loadedScheme);
				}
			},

			/**
			 * Возвращает объект entity схемы
			 * @param {String} schemaUId уникальный ижентификатор схемы,
			 * @return {Terrasoft.BaseEntitySchema} Базовая схема
			 */
			getBaseEntitySchemaByUId: function(schemaUId) {
				var schemaName;
				switch (schemaUId.toLowerCase()) {
					case SectionDesignerEnums.BaseSchemeUIds.BASE_ENTITY:
						schemaName = "BaseEntity";
						break;
					case SectionDesignerEnums.BaseSchemeUIds.BASE_FILE:
						schemaName = "File";
						break;
					case SectionDesignerEnums.BaseSchemeUIds.BASE_FOLDER:
						schemaName = "BaseFolder";
						break;
					case SectionDesignerEnums.BaseSchemeUIds.BASE_LOOKUP:
						schemaName = "BaseLookup";
						break;
					case SectionDesignerEnums.BaseSchemeUIds.BASE_ITEM_IN_FOLDER:
						schemaName = "BaseItemInFolder";
						break;
					case SectionDesignerEnums.BaseSchemeUIds.BASE_TAG:
						schemaName = "BaseTag";
						break;
					case SectionDesignerEnums.BaseSchemeUIds.BASE_ENTITY_IN_TAG:
						schemaName = "BaseEntityInTag";
						break;
					default:
						throw new Terrasoft.UnsupportedTypeException();
				}
				return Terrasoft[schemaName];
			},

			/**
			 * Возвращает "пустые" данные дизайнера
			 * @return {Object} Базовая схема
			 */
			getEmptyDesignData: function() {
				var emptyDesignData = {
					mainModuleName: null,
					module: {},
					schemaManager: {
						entity: {},
						clientUnit: {}
					},
					data: {},
					gridSettings: {
						modifiedData: {},
						originalData: {}
					},
					detailGridSettings: {}
				};
				return emptyDesignData;
			},

			/**
			 * Сравнивает данные дизайнера
			 * @param {Object} designData Данные дизайнера
			 * @return {Boolean} Результат проверки
			 */
			isDesignDataEqual: function(designDataToCompare) {
				var result = (JSON.stringify(designData) === JSON.stringify(designDataToCompare));
				return result;
			}
		};

		/**
		 * Локальное хранилище данных
		 * @private
		 * {Terrasoft.MemoryStore}
		 */
		var storage = Terrasoft.DomainCache;

		/**
		 * Возвращает уникальный для пользователя ключ локального хранилища данных
		 * @private
		 * @return {String} уникальный для пользователя ключ локального хранилища данных
		 */
		function getDesignDataStrorageItemKey() {
			var designDataKeyTemplate = "SectionDesigner_DesignData_{0}";
			return Ext.String.format(designDataKeyTemplate, Terrasoft.SysValue.CURRENT_USER.value);
		}

		/**
		 * Уникальный для пользователя ключ локального хранилища данных
		 * @private
		 * {Terrasoft.MemoryStore}
		 */
		var designDataStorageKey = getDesignDataStrorageItemKey();

		/**
		 * Ищет данные дизайнера в хранилище
		 * @private
		 * @return {String} Данные дизайнера в хранилище
		 */
		function findStorageDesignData() {
			// TODO #279141 UI: SectionDesigner. Временно отключить работу с LocalStorage
			var result = null;
			/*if (!Ext.isEmpty(storage)) {
			result = storage.getItem(designDataStorageKey);
			}*/
			return result;
		}

		function createEntitySchema(config) {
			var result = {
				schemaManager: {
					entity: {}
				}
			};
			var entitySchemaManager = result.schemaManager.entity;
			var entity = SectionDesignerUtils.createEntitySchema({
				name: config.name,
				caption: config.caption,
				rootEntitySchema: config.rootEntitySchema
			});
			entitySchemaManager[entity.name] = SectionDesignerUtils.getEntitySchemaDesignData(entity, []);
			setDesignData(result);
		}

		function createColumn(entitySchemaName, columnConfig) {
			var entitySchema = designData.schemaManager.entity[entitySchemaName];
			if (entitySchema) {
				var metaInfo = entitySchema.metaInfo;
				var columns = metaInfo.modifiedData.columns = metaInfo.modifiedData.columns || {};
				var newColumn = SectionDesignerUtils.createEntitySchemaColumn(columnConfig);
				columns[newColumn.uId] = newColumn;
			}
			saveDesignDataToStorage();
		}

		function modifyColumn(entitySchemaName, columnUId, columnConfig) {
			var entitySchema = designData.schemaManager.entity[entitySchemaName];
			if (entitySchema) {
//			if (entitySchema.findColumnByUId(columnUId) == null) {
//				throw 'exception: column does not exists';
//			}
				var metaInfo = entitySchema.metaInfo;
				var columns = metaInfo.modifiedData.columns = metaInfo.modifiedData.columns || {};
				var column = columns[columnUId] = columns[columnUId] || {};
				Ext.apply(column, columnConfig);
			}
			saveDesignDataToStorage();
		}

		/**
		 * Удаляет данные дизайнера из хранилища
		 * @private
		 */
		function clearStorageDesignData() {
			if (!Ext.isEmpty(storage)) {
				storage.removeItem(designDataStorageKey);
			}
		}

		/**
		 * Сохраняет данные дизайнера в хранилище
		 * @private
		 */
		function saveDesignDataToStorage() {
			// TODO #279141 UI: SectionDesigner. Временно отключить работу с LocalStorage
			//if (Ext.isEmpty(storage)) {
			//return;
			//}
			/*var storageDesignData = Terrasoft.deepClone(designData);
			var schemaManager = storageDesignData.schemaManager;
			var entitySchemaInfo = schemaManager.entity;
			Terrasoft.each(entitySchemaInfo, function(item) {
				delete item.schema;
			});
			var clientUnitsSchemaInfo = schemaManager.clientUnit;
			Terrasoft.each(clientUnitsSchemaInfo, function(item) {
				var metaInfo = item.schema.metaInfo;
				if (metaInfo.modificationType === SectionDesignerEnums.ModificationType.MODIFIED) {
					delete item.schema.originData;
				}
				var resourcesMetaInfo = item.resources.metaInfo;
				if (resourcesMetaInfo.modificationType === SectionDesignerEnums.ModificationType.MODIFIED) {
					delete item.resources.originData;
				}
				var structureMetaInfo = item.structure.metaInfo;
				if (structureMetaInfo.modificationType === SectionDesignerEnums.ModificationType.MODIFIED) {
					delete item.structure.originData;
				}
			});
			var hashArray = window.location.hash.split("/");
			if (hashArray.length > 2) {
				storageDesignData.stepName = hashArray[2];
			}
			storage.setItem(designDataStorageKey, JSON.stringify(storageDesignData));*/
		}

		/**
		 * Загружает данные дизайнера из хранилища
		 * @private
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope объект в контексте которого будет выполняться функция обратного вызова
		 */
		function loadDesignDataFromStorage(callback, scope) {
			var stringifiedDesignData = findStorageDesignData();
			if (Ext.isEmpty(stringifiedDesignData)) {
				return;
			}
			var storageDesignData = Terrasoft.decode(stringifiedDesignData);
			var schemaManager = storageDesignData.schemaManager;
			resetDesignData();
			Terrasoft.chain({
				storageDesignData: storageDesignData
			}, [
				function(context) {
					context.maskId = Terrasoft.Mask.show();
					var entitySchemaInfo = schemaManager.entity;
					var entitySchemaNames = [];
					Terrasoft.each(entitySchemaInfo, function(item, key) {
						var metaInfo = item.metaInfo;
						if (metaInfo.modificationType === SectionDesignerEnums.ModificationType.MODIFIED) {
							entitySchemaNames.push(key);
						} else {
							var modifiedData = Terrasoft.deepClone(metaInfo.modifiedData);
							delete modifiedData.columns;
							delete modifiedData.rootEntitySchemaId;
							modifiedData.rootEntitySchema =
								utils.getBaseEntitySchemaByUId(metaInfo.modifiedData.rootEntitySchemaId);
							schemaManager.entity[key].schema = SectionDesignerUtils.createEntitySchema(modifiedData);
						}
					});
					getEntitySchemeByName(entitySchemaNames, function(loadedScheme) {
						for (var i = 0, entitySchemaNamesLength = entitySchemaNames.length;
								i < entitySchemaNamesLength; i++) {
							var currentSchemaName = entitySchemaNames[i];
							schemaManager.entity[currentSchemaName].schema =
								loadedScheme[currentSchemaName];
						}
						context.next();
					});
				},
				function(context) {
					var clientUnitSchemaInfo = schemaManager.clientUnit;
					var clientUnitSchemaNames = [];
					Terrasoft.each(clientUnitSchemaInfo, function(item, key) {
						if (item.resources.metaInfo.modificationType === SectionDesignerEnums.ModificationType.MODIFIED ||
							item.structure.metaInfo.modificationType === SectionDesignerEnums.ModificationType.MODIFIED ||
							item.schema.metaInfo.modificationType === SectionDesignerEnums.ModificationType.MODIFIED) {
							clientUnitSchemaNames.push(key);
						}
					});
					getClientUnitSchemeByName(clientUnitSchemaNames, function(loadedScheme) {
						for (var i = 0, clientUnitSchemaNamesLength = clientUnitSchemaNames.length;
								i < clientUnitSchemaNamesLength; i++) {
							var currentSchemaName = clientUnitSchemaNames[i];
							schemaManager.clientUnit[currentSchemaName].schema =
								loadedScheme[currentSchemaName];
						}
						context.next();
					});
				},
				function(context) {
					setDesignData(context.storageDesignData);
					Terrasoft.Mask.hide(context.maskId);
					callback.call(scope);
				}
			]);

		}

		/**
		 * Объект данных дизайнера
		 * @private
		 * @type {Object}
		 * @param {String} designData.mainModuleName Название редактируемого раздела
		 * @param {Object} designData.module Объект структуры редактируемого раздела
		 * Примеры использования:
		 *    Module1 = {
*		caption: "Раздел1",
*		code: "Module1",
*		entityFolderId: "76712ea9-f024-420b-969f-fca7c10aecc9",
*		entityFolderName: "Module1Folder",
*		entityId: "7efb50bd-5d5a-48b5-8a8b-fdc2b4f5c6b9",
*		entityInFolderId: "83ee35f3-4c25-49e5-b61a-5990dcda6013",
*		entityInFolderName: "Module1InFolder",
*		entityName: "Module1",
*		id: "8ae0409c-7384-42f7-9ede-48bbbea6bf24",
*		pages: [{
*			id: "96e31f77-c89b-4619-b2a5-9c9fbbeb75fc",
*			moduleCode: "Module1",
*			name: "Module1Page",
*			typeColumnValue: "00000000-0000-0000-0000-000000000000"
*		}],
*		sectionSchemaId: "96e31f77-c89b-4619-b2a5-9c9fbbeb75fc",
*		sectionSchemaName: "Module1Section",
*		typeColumnId: "83ee35f3-4c25-49e5-b61a-5990dcda6013"
*	}
		 * @param {Object} designData.schemaManager Объект менеджера схем раздела
		 * @param {Object} designData.schemaManager.entity Объект менеджера Entity схем раздела
		 * Примеры использования:
		 *    Module1: {
*		metaInfo: {
*			modificationType: SectionDesignerEnums.ModificationType.NEW,
*			modifiedData: {
*				administratedByRecords: true,
*				caption: "Раздел1",
*				columns: {
*					"94cd05ac-609e-4b4e-b209-a4180e5767f6": {
*						caption: "Название",
*						dataValueType: Terrasoft.DataValueType.Text,
*						isRequired: true,
*						isValueCloneable: true,
*						name: "Name",
*						size: 250,
*						uId: "c9c88303-4909-46fe-874c-5a8b8f380a85"
*					}
*				}
*			}
*		},
*		schema: {}
*	}
		 * @param {Object} designData.schemaManager.clientUnit Объект менеджера клиентских схем раздела
		 * Примеры использования:
		 *    Module1Page: {
*		metaInfo: {
*			modificationType: SectionDesignerEnums.ModificationType.NEW,
*			modifiedData: {}
*		}
*		schema: {}
*	}
		 * @param {Object} designData.data Объект данных
		 * Примеры использования:
		 *    Module1 = [
		 *        {
*			metaInfo: {
*			modificationType: SectionDesignerEnums.ModificationType.NEW,
*			modifiedData: {
*				Id: "566bbe3b-6fce-4d88-b292-163db9ea7644",
*				Name: "Module1Record1"
*			}
*		}
*		},
		 *        {
*			metaInfo: {
*				modificationType: SectionDesignerEnums.ModificationType.MODIFIED,
*				modifiedData: {
*					Name: "Module1Record2"
*				}
*			},
*			Id: "566bbe3b-6fce-4d88-b292-163db9ea7644"
*		},
		 *        {
*			metaInfo: {
*				modificationType: SectionDesignerEnums.ModificationType.DELETED
*			},
*			Id: "566bbe3b-6fce-4d88-b292-163db9ea7644"
*		}
		 * ]
		 */
		var designData = {
			mainModuleName: null,
			module: {},
			schemaManager: {
				entity: {},
				clientUnit: {}
			},
			data: {},
			gridSettings: {
				modifiedData: {},
				originalData: {}
			},
			workplaceId: null
		};

		/**
		 * Удаляет клиентскую схему из данных дизайнера
		 * @param {String} schemaName Название схемы
		 */
		var deleteClientUnitSchema = function(schemaName) {
			delete designData.schemaManager.clientUnit[schemaName];
			saveDesignDataToStorage();
		};

		/**
		 * Удаляет entity схему из данных дизайнера
		 * @param {String} schemaName Название схемы
		 */
		var deleteEntitySchema = function(schemaName) {
			delete designData.schemaManager.entity[schemaName];
			saveDesignDataToStorage();
		};

		/**
		 * Удаляет колонку entity схемы из данных дизайнера
		 * @param {String} schemaName Название схемы
		 * @param {String} columnUId Идентификатор колонки
		 */
		var deleteEntitySchemaColumn = function(schemaName, columnUId) {
			var schema = designData.schemaManager.entity[schemaName];
			if (schema && schema.metaInfo && schema.metaInfo.modifiedData && schema.metaInfo.modifiedData.columns) {
				delete schema.metaInfo.modifiedData.columns[columnUId];
			}
			saveDesignDataToStorage();
		};

		/**
		 * Обнуляет объект данных дизайнера
		 * @private
		 */
		var resetDesignData = function() {
			designData = utils.getEmptyDesignData();
			clearStorageDesignData();
		};

		/**
		 * Возвращает масив объектов данных
		 * @param {String} schemaName Название схемы
		 * @param {String[]} columns Массив колонок, которые необходимо загрузить
		 * @param {Boolean} isOriginal Признак того, что надо вернуть начальные, не модифицированные данные,
		 * если значение true. Если false, нужно вернуть модифицированные данные
		 * @param {Function} callback Ф-ия обратного вызова
		 */
		var getEntities = function(schemaName, columns, isOriginal, callback) {
			var schemaData = utils.getEntitySchemaData(schemaName, isOriginal);
			var designedSchema = designData.schemaManager.entity[schemaName];
			if ((schemaData.length > 0) || (designedSchema && designedSchema.metaInfo.modificationType ===
				SectionDesignerEnums.ModificationType.NEW)) {
				callback(schemaData);
			} else {
				if (columns && columns.length > 0) {
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: schemaName
					});
					for (var i = 0, columnsLength = columns.length; i < columnsLength; i++) {
						select.addColumn(columns[i]);
					}
					if (!select.columns.find("Id")) {
						select.addColumn("Id");
					}
					select.getEntityCollection(function(responce) {
						var responceArray = [];
						responce.collection.each(function(item) {
							responceArray.push(item.values);
						});
						utils.setData(schemaName, responceArray);
						schemaData = utils.getEntitySchemaData(schemaName, isOriginal);
						callback(schemaData);
					});
				}
			}
		};

		/**
		 * Возвращает объект данных
		 * @param {String} schemaName Название схемы
		 * @param {String} id Идентификатор записи
		 * @param {String[]} columns Массив колонок, которые необходимо загрузить
		 * @param {Boolean} isOriginal Признак того, что надо вернуть начальные, не модифицированные данные,
		 * если значение true. Если false, нужно вернуть модифицированные данные
		 * @param {Function} callback Ф-ия обратного вызова
		 */
		var getEntityById = function(schemaName, id, columns, isOriginal, callback) {
			var schemaData = utils.getEntitySchemaDataById(schemaName, isOriginal, id);
			var designedSchema = designData.schemaManager.entity[schemaName];
			if ((schemaData) || (designedSchema && designedSchema.metaInfo.modificationType ===
				SectionDesignerEnums.ModificationType.NEW)) {
				callback(schemaData);
			} else {
				if (columns && columns.length > 0) {
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: schemaName
					});
					select.filters.add("entityId", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "Id", id));
					for (var i = 0, columnsLength = columns.length; i < columnsLength; i++) {
						select.addColumn(columns[i]);
					}
					if (!select.columns.find("Id")) {
						select.addColumn("Id");
					}
					select.getEntityCollection(function(responce) {
						var responceArray = designData.data[schemaName] || [];
						var result = [];
						responce.collection.each(function(item) {
							result.push(item.values);
						});
						Ext.Array.push(responceArray, result);
						utils.setData(schemaName, responceArray);
						callback(result[0]);
					});
				}
			}
		};

		/**
		 * Отменяет изменения данных
		 * @param {String} schemaName Название схемы
		 * @param {String[]} entityIds массив идентификаторов записей, для которых надо отменить изменения.
		 * Если этот параметр не передан, надо отменить изменения для всех записей схемы
		 */
		var revertEntityChanges = function(schemaName, entityIds) {
			var data = designData.data[schemaName];
			entityIds = entityIds || [];
			var deletedIndexes = [];
			for (var i = 0, length = data.length; i < length; i++) {
				var item = data[i];
				if ((entityIds.length === 0) || (entityIds.indexOf(item.Id) > -1)) {
					var itemMetaInfo = item.metaInfo;
					delete item.metaInfo;
					if (itemMetaInfo && (itemMetaInfo.modificationType ===
						SectionDesignerEnums.ModificationType.NEW)) {
						deletedIndexes.push(i);
					}
				}
			}
			//TODO изменить на while(delIndex = a.pop()) если будет решено, что этот код допустим, и будут исправлены
			// проверки JSHint"a
			//#255950
			//UI: Уточнить настройки JSHint"a, см. Описание
			var deleteIndex;
			while (deletedIndexes.length) {
				deleteIndex = deletedIndexes.pop();
				data.splice(deleteIndex, 1);
			}
			saveDesignDataToStorage();
		};

		/**
		 * Отменяет изменения данных
		 * @param {String[]} names массив идентификаторов записей, для которых надо отменить изменения.
		 * Если этот параметр не передан, надо отменить изменения для всех схем
		 */
		function revertClientUnitSchemaChanges(names) {
			var scheme = designData.schemaManager.clientUnit;
			var deletedNames = [];
			Terrasoft.each(scheme, function(schema) {
				if (!names || Terrasoft.contains(names, schema.name)) {
					var schemaMetaInfo = schema.metaInfo;
					delete schema.metaInfo;
					if (schemaMetaInfo && (schemaMetaInfo.modificationType ===
						SectionDesignerEnums.ModificationType.NEW)) {
						deletedNames.push(schema.name);
					}
				}
			});
			var name;
			//TODO изменить на while(delIndex = a.pop()) если будет решено, что этот код допустим, и будут исправлены
			// проверки JSHint"a
			//#255950
			//UI: Уточнить настройки JSHint"a, см. Описание
			while (deletedNames.length) {
				name = deletedNames.pop();
				delete scheme[name];
			}
			saveDesignDataToStorage();
		}

		/**
		 * Формирует мета информацию для вставки записи
		 * @param {String} schemaName Название схемы
		 * @param {Object} columnValues Значения колонок
		 * Примеры использования:
		 *    {
*		Name: "Name1",
*		Description: "Description1"
*	}
		 */
		var addEntity = function(schemaName, columnValues) {
			columnValues.Id = columnValues.Id || Terrasoft.generateGUID();
			var entity = {
				metaInfo: {
					modificationType: SectionDesignerEnums.ModificationType.NEW,
					modifiedData: columnValues
				},
				Id: columnValues.Id
			};
			designData.data[schemaName] = designData.data[schemaName] || [];
			designData.data[schemaName].push(entity);
			saveDesignDataToStorage();
		};

		/**
		 * Формирует мета информацию для модификации записи
		 * @param {String} schemaName Название схемы
		 * @param {Object} columnValues Значения колонок
		 * Примеры использования:
		 *    {
*		Name: "Name1",
*		Description: "Description1"
*	}
		 * @param {String} primaryColumnValue Значение первичной колонки
		 */
		var modifyEntity = function(schemaName, columnValues, primaryColumnValue) {
			var entity = utils.getInnerEntityById(schemaName, primaryColumnValue);
			if (entity) {
				var entityMetaInfo = entity.metaInfo || {};
				entityMetaInfo = {
					metaInfo: {
						modificationType: (entityMetaInfo.modificationType === SectionDesignerEnums.ModificationType.NEW) ?
							SectionDesignerEnums.ModificationType.NEW : SectionDesignerEnums.ModificationType.MODIFIED,
						modifiedData: Ext.apply(entityMetaInfo.modifiedData || {}, columnValues)
					}
				};
				Ext.apply(entity, entityMetaInfo);
			}
			saveDesignDataToStorage();
		};

		/**
		 * Формирует мета информацию для удаления записи
		 * @param {String} schemaName Название схемы
		 * @param {String} primaryColumnValue Значение первичной колонки
		 */
		var deleteEntity = function(schemaName, primaryColumnValue) {
			var data = designData.data[schemaName];
			if (!data) {
				data = [];
				designData.data[schemaName] = data;
			}
			var entity = utils.getInnerEntityById(schemaName, primaryColumnValue);
			if (!entity) {
				entity = {
					Id: primaryColumnValue
				};
				data.push(entity);
			}
			var entityMetaInfo = entity.metaInfo;
			if (entityMetaInfo && (entityMetaInfo.modificationType ===
				SectionDesignerEnums.ModificationType.NEW)) {
				for (var i = 0, dataLength = data.length; i < dataLength; i++) {
					if (data[i].Id === entity.Id) {
						data.splice(i, 1);
						break;
					}
				}
			} else {
				entityMetaInfo = {
					metaInfo: {
						modificationType: SectionDesignerEnums.ModificationType.DELETED
					}
				};
				Ext.apply(entity, entityMetaInfo);
			}
			saveDesignDataToStorage();
		};

		/**
		 * Загружает имена схем названия которых содержит код раздела
		 * @param {String} sectionCode Название раздела
		 * @param {Function} callback
		 */
		var loadLikeSchemaNames = function(sectionCode, callback) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SysSchema",
				isDistinct: true
			});
			select.addColumn("UId");
			select.addColumn("Name");
			select.filters.add("AcountIdFilter", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.CONTAIN, "Name", sectionCode));
			var result = {
				likeSchemaNames: []
			};
			Terrasoft.chain({
				result: result,
				scope: this
			}, [
				function(context) {
					select.getEntityCollection(function(responce) {
						result.ESQResult = responce;
						context.next();
					});
				},
				function(context) {
					if (result.ESQResult.success) {
						result.ESQResult.collection.each(function(item) {
							result.likeSchemaNames.push(item.get("Name"));
						});
					}
					context.next();
				},
				function(context) {
					callback.call(context.scope, result.likeSchemaNames);
					context.next();
				}
			]);
		};

		/**
		 * Добавляет информацию о структуре модуля
		 * @param {Object} config структура модуля
		 */
		var setModuleStructureInfo = function(config) {
			var defaultModuleConfig = {
				code: "",
				entityTagId: Terrasoft.generateGUID(),
				entityTagName: "",
				entityInTagId: Terrasoft.generateGUID(),
				entityInTagName: "",
				entityFolderId: Terrasoft.generateGUID(),
				entityFolderName: "",
				entityId: Terrasoft.generateGUID(),
				entityInFolderId: Terrasoft.generateGUID(),
				entityInFolderName: "",
				entityName: "",
				id: Terrasoft.generateGUID(),
				pages: [],
				sectionSchemaId: Terrasoft.generateGUID(),
				sectionSchemaName: "",
				typeColumnId: Terrasoft.generateGUID(),
				sectionIconId: null,
				sectionLogoId: null
			};
			Ext.apply(defaultModuleConfig, config);
			designData.module[defaultModuleConfig.code] = designData.module[defaultModuleConfig.code] || {};
			var moduleStructure = designData.module[defaultModuleConfig.code];
			designData.mainModuleName = defaultModuleConfig.code;
			Ext.merge(moduleStructure, defaultModuleConfig);
			setModuleStructureData(moduleStructure);
		};

		/**
		 * добавляет блок данных с информацией о разделе
		 * @param {Object} moduleStructure структура раздела
		 */
		function setModuleStructureData(moduleStructure) {
			var SectionSchemaIds = SectionDesignerEnums.SectionSchemaIds;
			var data = {
				SysModuleEntity: [{
					Id: moduleStructure.sysModuleEntityId,
					SysEntitySchemaUId: moduleStructure.entityId,
					TypeColumnUId: moduleStructure.typeColumnId
				}],
				SysModule: [{
					Id: moduleStructure.id,
					Caption: moduleStructure.caption,
					SysModuleEntity: moduleStructure.sysModuleEntityId,
					FolderMode: SectionDesignerEnums.ModuleFolderType.MultiFolderEntry,
					GlobalSearchAvailable: true,
					HasAnalytics: true,
					HasActions: true,
					Code: moduleStructure.code,
					ModuleHeader: moduleStructure.header,
					SectionModuleSchemaUId: SectionSchemaIds.SectionModuleSchemaUId,
					SectionSchemaUId: moduleStructure.sectionSchemaId,
					CardModuleUId: SectionSchemaIds.CardModuleUId,
					Image32: moduleStructure.sectionIconId,
					Logo: moduleStructure.sectionLogoId
				}],
				SysModuleLcz: [
					{Id: moduleStructure.sysModuleCaptionLczId},
					{Id: moduleStructure.sysModuleHeaderLczId}
				],
				SysModuleEdit: [],
				SysModuleEditLcz: [],
				SysDetail: [{Id: moduleStructure.sectionDetailId}]
			};
			Terrasoft.each(moduleStructure.pages, function(page) {
				var typeColumnValue = page.typeColumnValue;
				var pageData = {
					Id: page.recordId,
					TypeColumnValue: typeColumnValue,
					UseModuleDetails: true,
					CardSchemaUId: page.id
				};
				data.SysModuleEdit.push(pageData);
				if (!SectionDesignerUtils.isEmptyOrEmptyGUID(typeColumnValue)) {
					var actionKindLczData = {
						Id: page.actionKindCaptionLczId
					};
					var captionLczData = {
						Id: page.pageCaptionLczId,
						Value: page.pageCaption
					};
					data.SysModuleEditLcz.push(actionKindLczData, captionLczData);
				}
			});
			setDesignData({
				data: data
			});
		}

		/**
		 * Добавляет существующую entity схему в design data для редактирования
		 * @param {String} schemaName объект схемы
		 * @param {Object} entity объект схемы
		 * @param {Object} modifiedData объект изменений схемы
		 * @return {Object} измененные данные схемы
		 */
		var modifyEntitySchemaDesignData = function(schemaName, entity, modifiedData) {
			var scheme = designData.schemaManager.entity;
			return modifySchemaDesignData(scheme, schemaName, entity, modifiedData);
		};

		/**
		 * Изменяет существующую clientUnit схему в design data
		 * @param {String} schemaData имя схемы
		 * @param {Object} modifiedData объект изменений схемы
		 */
		var modifyClientUnitSchemaData = function(schemaData, modifiedData) {
			var metaInfo = schemaData.metaInfo;
			Ext.merge(metaInfo.modifiedData, modifiedData);
			saveDesignDataToStorage();
		};

		/**
		 * Изменяет существующую clientUnit схему в design data
		 * @param {String} schemaName имя схемы
		 * @param {Object} modifiedData объект изменений схемы
		 */
		var modifyClientUnitSchema = function(schemaName, modifiedData) {
			var scheme = designData.schemaManager.clientUnit;
			var schemaData = scheme[schemaName];
			modifyClientUnitSchemaData(schemaData.schema, modifiedData);
		};

		/**
		 * Изменяет ресурсы существующей clientUnit схемы в design data
		 * @param {String} schemaName имя схемы
		 * @param {Object} modifiedData объект изменений схемы
		 */
		var modifyClientUnitResources = function(schemaName, modifiedData) {
			var scheme = designData.schemaManager.clientUnit;
			var schemaData = scheme[schemaName];
			modifyClientUnitSchemaData(schemaData.resources, modifiedData);
		};

		/**
		 * Изменяет структуру существующей clientUnit схемы в design data
		 * @param {String} schemaName имя схемы
		 * @param {Object} modifiedData объект изменений схемы
		 */
		var modifyClientUnitStructure = function(schemaName, modifiedData) {
			var scheme = designData.schemaManager.clientUnit;
			var schemaData = scheme[schemaName];
			modifyClientUnitSchemaData(schemaData.structure, modifiedData);
		};

		/**
		 * Добавляет существующую схему в design data для редактирования
		 * @param {Object[]} scheme объект схем данных дизайнера
		 * @param {String} schemaName Имя схемы
		 * @param {Object} schema объект схемы
		 * @param {Object} modifiedData объект изменений схемы
		 * @return {Object} измененные данные схемы
		 */
		function modifySchemaDesignData(scheme, schemaName, schema, modifiedData) {
			var schemaData = scheme[schemaName] = scheme[schemaName] || {
				metaInfo: {
					modificationType: SectionDesignerEnums.ModificationType.MODIFIED,
					modifiedData: {}
				},
				schema: {}
			};
			var metaInfo = schemaData.metaInfo;
			Ext.apply(schemaData.schema, schema);
			Ext.apply(metaInfo.modifiedData, modifiedData);
			saveDesignDataToStorage();
			return schemaData;
		}

		/**
		 * Возвращает объект данных дизайнера в callback
		 * @param {Function} callback функция обратного вызова,
		 */
		var getDesignData = function(callback, scope) {
			scope = scope || this;
			var returnDesingData = Terrasoft.deepClone(designData);
			callback.call(scope, returnDesingData);
		};

		/**
		 * Применяет изменения к объекту данных дизайнера
		 * @param {Object} designDataConfig объект изменений,
		 */
		var setDesignData = function(designDataConfig) {
			Ext.Object.merge(designData, designDataConfig);
			SectionDesignerUtils.modulesStructure = designData.module;
			saveDesignDataToStorage();
		};

		/**
		 * Устанавливает настройки профиля детали.
		 * @params {String} detailKey Уникальный ключ детали.
		 * @params {Object} gridSettings Конфигурация колонок.
		 */
		var setDetailGridSettings = function(detailKey, gridSettings) {
			designData.detailGridSettings[detailKey] = gridSettings;
		};

		/**
		 * Удаляет настройки профиля детали.
		 * @params {String} detailKey Уникальный ключ детали.
		 */
		var deleteDetailGridSettings = function(detailKey) {
			delete designData.detailGridSettings[detailKey];
		};

		/**
		 * Возвращает объект entity схемы в callback найденой по имени
		 * @param {Object} config объект параметров:
		 * @param {String} config.name название схемы,
		 * @param {Function} config.callback функция обратного вызова,
		 * @param {Object} config.scope контекст выполнения функциии обратного вызова
		 * @param {Boolean} config.isOriginal признак возвращения изначальной схемы без изменений,
		 */
		var getEntitySchemaByName = function(config) {
			utils.getSchema(config);
		};

		/**
		 * Возвращает объект entity схем в callback найденых по имени
		 * @param {String[]} schemaNames названия схем,
		 * @param {Function} callback функция обратного вызова
		 * @param {Object} scope объект в контексте которого будет выполняться функция обратного вызова
		 */
		var getEntitySchemeByName = function(schemaNames, callback, scope) {
			var config = {
				schemaNames: schemaNames,
				isClientUnit: false,
				callback: function(loadedScheme) {
					callback.call(scope, loadedScheme);
				}
			};
			utils.getSchemeByName(config);
		};

		/**
		 * Возвращает объект entity схемы в callback найденой по идентификатору
		 * @param {Object} config объект параметров:
		 * @param {String} config.id идентификатор схемы,
		 * @param {Function} config.callback функция обратного вызова,
		 * @param {Object} config.scope контекст выполнения функциии обратного вызова
		 * @param {Boolean} config.isOriginal признак возвращения изначальной схемы без изменений,
		 */
		var getEntitySchemaByUId = function(config) {
			utils.getSchema(config);
		};

		/**
		 * Возвращает объект clientUnit схемы в callback найденой по имени
		 * @param {Object} config объект параметров:
		 * @param {String} config.name название схемы,
		 * @param {Function} config.callback функция обратного вызова,
		 * @param {Object} config.scope контекст выполнения функциии обратного вызова
		 * @param {Boolean} config.isOriginal признак возвращения изначальной схемы без изменений,
		 */
		var getClientUnitSchemaByName = function(config) {
			config.isClientUnit = true;
			utils.getSchema(config);
		};

		/**
		 * Возвращает объект entity схем в callback найденых по имени
		 * @param {String[]} schemaNames названия схем,
		 * @param {Function} callback функция обратного вызова,
		 * @param {Object} scope объект в контексте которого будет выполняться функция обратного вызова
		 */
		var getClientUnitSchemeByName = function(schemaNames, callback, scope) {
			var config = {
				schemaNames: schemaNames,
				isClientUnit: true,
				callback: function(loadedScheme) {
					callback.call(scope, loadedScheme);
				}
			};
			utils.getSchemeByName(config);
		};

		/**
		 * Возвращает объект сlientUnit схемы в callback найденой по идентификатору
		 * @param {Object} config объект параметров:
		 * @param {String} config.name название схемы,
		 * @param {function} config.callback функция обратного вызова,
		 * @param {Object} config.scope контекст выполнения функциии обратного вызова
		 * @param {Boolean} config.isOriginal признак возвращения изначальной схемы без изменений,
		 */
		var getClientUnitSchemaByUId = function(config) {
			config.isClientUnit = true;
			utils.getSchema(config);
		};

		/**
		 * Возвращает имя основного модуля
		 * @return {String} имя основного модуля
		 */
		var getMainModuleName = function() {
			return designData.mainModuleName;
		};

		/**
		 * Возвращает структуру раздела
		 * @param {String} moduleName имя модуля
		 * @return {Object} структура раздела
		 */
		var getModuleStructure = function(moduleName) {
			return designData.module[moduleName];
		};

		/**
		 * Функция сохраниения результатов работы мастера
		 */
		var save = function() {
			Terrasoft.chain({
				savedSuccessfullyMessage: localizableStrings.savedSuccessfully,
				savedUnsuccessfullyMessage: localizableStrings.savedUnsuccessfully,
				requestTimeout: 60000000
			}, [
				function(context) {
					var currentPackageId = storage.getItem("SectionDesigner_CurrentPackageUId");
					if (SectionDesignerUtils.isEmptyOrEmptyGUID(currentPackageId)) {
						SectionDesignerUtils.getCurrentPackageUId(function(result) {
							if (result) {
								context.next();
							}
						});
					} else {
						context.next();
					}
				},
				function(context) {
					context.maskId = Terrasoft.Mask.show();
					utils.getPostDesignData(function(postDesignData) {
						context.postDesignData = postDesignData;
						resetDesignData();
						context.next();
					});
				},
				function(context) {
					SectionDesignerUtils.postServiceRequest({
						timeout: context.requestTimeout,
						methodName: "SaveScheme",
						parameters: {
							designData: context.postDesignData
						},
						scope: this,
						callback: function(request, success, response) {
							if (success) {
								var responseObject = Terrasoft.decode(response.responseText);
								var result = responseObject.SaveSchemeResult;
								if (!result.Success) {
									Terrasoft.Mask.hide(context.maskId);
									if (result.CompilerErrors) {
										var modalPageId = sandbox.id + "_ModalPage";
										var modalBoxContainer = ModalBox.show();
										ModalBox.setSize(820, 600);
										sandbox.subscribe("GetErrorsConfig", function() {
											return result.CompilerErrors;
										}, [modalPageId]);
										sandbox.loadModule("SectionDesignerLogModule", {
											renderTo: modalBoxContainer,
											id: modalPageId,
											keepAlive: true
										});
									} else {
										var errorText = result.ErrorMessage;
										Terrasoft.Mask.hide(context.maskId);
										Terrasoft.utils.showMessage({
											caption: Ext.String.format(context.savedUnsuccessfullyMessage, errorText),
											buttons: ["ok"],
											defaultButton: 0,
											style: Terrasoft.MessageBoxStyles.BLUE,
											handler: null
										});
									}
								} else {
									context.next();
								}
							} else {
								Terrasoft.Mask.hide(context.maskId);
							}
						}
					});
				},
				function(context) {
					SectionDesignerUtils.postServiceRequest({
						timeout: context.requestTimeout,
						methodName: "SaveData",
						parameters: {
							designData: context.postDesignData
						},
						scope: this,
						callback: function(request, success, response) {
							Terrasoft.Mask.hide(context.maskId);
							if (success) {
								var responseObject = Terrasoft.decode(response.responseText);
								var result = responseObject.SaveDataResult;
								var resultMessage = (result.Success) ? context.savedSuccessfullyMessage :
									Ext.String.format(context.savedUnsuccessfullyMessage, result.ErrorMessage);
								Terrasoft.utils.showMessage({
									caption: resultMessage,
									buttons: ["ok"],
									defaultButton: 0,
									style: Terrasoft.MessageBoxStyles.BLUE,
									handler: function() {
										Terrasoft.DomainCache.setItem("SectionDesigner_DetailsInfo", null);
										Terrasoft.DomainCache.setItem("DetailsInfo", null);
										window.close();
									}
								});
							}
						}
					});
				}
			]);
		};

		/**
		 * Флаг инициализации модуля
		 * @private
		 * @type {Boolean}
		 */
		var moduleInitialized = false;

		/**
		 * Функция инициализации модуля
		 * @public
		 * @param {Object} sandbox Песочница модуля
		 */
		function init(sandbox, callback) {
			initSandbox(sandbox);
			if (!moduleInitialized) {
				moduleInitialized = true;
				var storageDesignData = findStorageDesignData();
				if (storageDesignData && !utils.isDesignDataEqual(storageDesignData)) {
					Terrasoft.utils.showMessage({
						caption: localizableStrings.storageDesignData,
						buttons: ["yes", "no"],
						defaultButton: 0,
						style: Terrasoft.MessageBoxStyles.BLUE,
						handler: function(buttonCode) {
							if (buttonCode === "yes") {
								loadDesignDataFromStorage(function() {
									callback.call(this);
								});
							} else {
								clearStorageDesignData();
								callback.call(this);
							}
						}
					});
					return;
				}
			}
			callback.call(this);
		}

		/**
		 * Загружает схемы
		 * @private
		 * @param {Object} config объект параметров:
		 * @param {String[]} config.schemaNames названия схем
		 * @param {Boolean} config.isClientUnit признак того, что схема является клиентским модулем
		 * @param {Function} config.callback функция обратного вызова
		 * @param {Object} config.scope контекст выполнения функциии обратного вызова
		 */
		function loadSchema(config) {
			var schemaNames, callback, scope, isClientUnit;
			schemaNames = config.schemaNames;
			callback = config.callback;
			scope = config.scope || window;
			isClientUnit = config.isClientUnit;
			var result = {
				entity: {},
				clientUnit: {}
			};
			if (!isClientUnit) {
				var moduleDescriptorsNames = [];
				for (var i = 0, schemaNamesLength = schemaNames.length; i < schemaNamesLength; i++) {
					moduleDescriptorsNames.push("force!" + schemaNames[i]);
				}
				Terrasoft.chain({
					moduleDescriptorsNames: moduleDescriptorsNames,
					schemaNames: schemaNames,
					scope: scope,
					result: result
				}, [
					function(context) {
						sandbox.requireModuleDescriptors(context.moduleDescriptorsNames, function() {
							context.next();
						}, context.scope);
					},
					function(context) {
						require(context.schemaNames, function() {
							for (var i = 0, schemeCount = arguments.length; i < schemeCount; i++) {
								var schema = arguments[i];
								result.entity[schemaNames[i]] = schema;
							}
							context.next();
						});
					},
					function(context) {
						callback.call(context.scope, context.result);
					}
				]);
			} else {
				require(schemaNames, function() {
					var clientUnitScheme = [];
					Terrasoft.each(arguments, function(requiredSchema) {
						var schema = Terrasoft.deepClone(requiredSchema);
						clientUnitScheme.push(schema);
					});
					loadClientUnitScheme(schemaNames, clientUnitScheme, result.clientUnit, function() {
						callback.call(scope, result);
					});
				});
			}
		}

		/**
		 * Функция загрузки схем клиентских модулей
		 * param {String[]} schemaNames Название схем
		 * param {Object[]} scheme Схемы клиентских модулей
		 * param {Object} result Колекция результирующих схем
		 * param {Function} callback функция обратного вызова
		 */
		function loadClientUnitScheme(schemaNames, scheme, result, callback) {
			if (schemaNames.length === 0) {
				callback.call(this, result);
			} else {
				var schemaName = schemaNames[0];
				var schema = scheme[0];
				schemaNames.splice(0, 1);
				scheme.splice(0, 1);
				loadClientUnitSchema(schemaName, schema, function(schema) {
					result[schemaName] = schema;
					loadClientUnitScheme(schemaNames, scheme, result, callback);
				});
			}
		}

		function loadClientUnitSchema(schemaName, schema, callback) {
			var structureName = schemaName + "Structure";
			var resourcesName = schemaName + "Resources";
			var clientUnitDesignData = {};
			var schemaDesignData = {
				schema: schema
			};
			clientUnitDesignData[schemaName] = schemaDesignData;
			require([structureName, resourcesName], function(structure, resources) {
				schemaDesignData.structure = structure;
				schemaDesignData.resources = resources;
				setLoadedSchemeDesignData(clientUnitDesignData, true);
				callback.call(this, schemaDesignData);
			});
		}

		/**
		 * Устанавливает данные дизайнера подгруженной схемы
		 * @private
		 * @param {Object} schemaConfig Конфиг подгруженной схемы
		 * @param {Boolean} isClientUnit признак того что схема является клиентской
		 */
		function setLoadedSchemeDesignData(schemaConfig, isClientUnit) {
			var setMethod = (!isClientUnit) ? modifyEntitySchemaDesignData :
				setClientUnitSchemaDesignData;
			var removeMethod = (!isClientUnit) ? deleteEntitySchema :
				deleteClientUnitSchema;
			Terrasoft.each(schemaConfig, function(schema, key) {
				if (schema) {
					removeMethod(key);
					setMethod(key, schema);
				}
			}, this);
		}

		/**
		 * Устанавливает данные клиентских схем в данные дизайнера
		 * @param {String} schemaName название клиентской схемы
		 * @param {Object} schemaOriginData клиентская схема
		 */
		function setClientUnitSchemaDesignData(schemaName, schemaOriginData) {
			var scheme = designData.schemaManager.clientUnit;
			scheme[schemaName] = {
				resources: SectionDesignerUtils.getClientUnitSchemaDesignDataBlock(schemaOriginData.resources,
					SectionDesignerEnums.ModificationType.MODIFIED),
				structure: SectionDesignerUtils.getClientUnitSchemaDesignDataBlock(schemaOriginData.structure,
					SectionDesignerEnums.ModificationType.MODIFIED),
				schema: SectionDesignerUtils.getClientUnitSchemaDesignDataBlock(schemaOriginData.schema,
					SectionDesignerEnums.ModificationType.MODIFIED)
			};
			saveDesignDataToStorage();
		}

		/**
		 * Функция инициализации sandbox
		 * @private
		 * @param {Object} arg агрумент функции
		 */
		function initSandbox(arg) {
			sandbox = arg;
		}

		return {
			createEntitySchema: createEntitySchema,
			createColumn: createColumn,
			modifyColumn: modifyColumn,
			getDesignData: getDesignData,
			setDesignData: setDesignData,
			setDetailGridSettings: setDetailGridSettings,
			deleteDetailGridSettings: deleteDetailGridSettings,
			getEntitySchemaByName: getEntitySchemaByName,
			getEntitySchemeByName: getEntitySchemeByName,
			getEntitySchemaByUId: getEntitySchemaByUId,
			getClientUnitSchemaByName: getClientUnitSchemaByName,
			getClientUnitSchemeByName: getClientUnitSchemeByName,
			getClientUnitSchemaByUId: getClientUnitSchemaByUId,
			getMainModuleName: getMainModuleName,
			getModuleStructure: getModuleStructure,
			modifyEntitySchemaDesignData: modifyEntitySchemaDesignData,
			modifyClientUnitSchema: modifyClientUnitSchema,
			modifyClientUnitResources: modifyClientUnitResources,
			modifyClientUnitStructure: modifyClientUnitStructure,
			mergeEntitySchema: utils.mergeEntitySchema,
			setModuleStructureInfo: setModuleStructureInfo,
			loadLikeSchemaNames: loadLikeSchemaNames,
			addEntity: addEntity,
			modifyEntity: modifyEntity,
			deleteEntity: deleteEntity,
			save: save,
			resetDesignData: resetDesignData,
			getEntities: getEntities,
			getEntityById: getEntityById,
			revertEntityChanges: revertEntityChanges,
			revertClientUnitSchemaChanges: revertClientUnitSchemaChanges,
			deleteClientUnitSchema: deleteClientUnitSchema,
			deleteEntitySchema: deleteEntitySchema,
			deleteEntitySchemaColumn: deleteEntitySchemaColumn,
			init: init,
			clearStorageDesignData: clearStorageDesignData,
			saveDesignDataToStorage: saveDesignDataToStorage
		};
	}
);