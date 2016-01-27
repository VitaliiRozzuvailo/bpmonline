define("PackageUtilities", ["PackageUtilitiesResources"], function(resources) {

		/**
		 * @class Terrasoft.configuration.mixins.PackageUtilities
		 * Миксин, реализующий работу с пакетами.
		 */
		Ext.define("Terrasoft.configuration.mixins.PackageUtilities", {
			alternateClassName: "Terrasoft.PackageUtilities",

			/**
			 * Уникальный идентификатор пакета.
			 * @private
			 * @type {String}
			 */
			packageUId: null,

			/**
			 * Инициализирует основные системные настройки для работы с пакетами.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initPackageSysSettings: function(callback, scope) {
				Terrasoft.SysSettings.querySysSettings(["CurrentPackageId", "CustomPackageUId"], callback, scope);
			},

			/**
			 * Возвращает значение локализированной строки.
			 * @protected
			 * @virtual
			 * @param {String} name Название локализированной строки.
			 * @return {String} Значение локализированной строки.
			 */
			getLocalizableStringValue: function(name) {
				return resources.localizableStrings[name];
			},

			/**
			 * Инициализирует миксин.
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				Terrasoft.chain(
					this.initPackageUId,
					function(next, result) {
						callback.call(scope, result);
					},
					this
				);
			},

			/**
			 * Генерирует запрос для получения UId пакета.
			 * @param {String} packageId Идентификатор системной настройки.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getSysPackageUId: function(packageId, callback, scope) {
				if (Ext.isEmpty(packageId) || Terrasoft.isEmptyGUID(packageId)) {
					callback.call(scope, null);
				}
				var entitySchemaQuery = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SysPackage"    });
				entitySchemaQuery.addColumn("UId");
				entitySchemaQuery.getEntity(packageId, function(result) {
					var resultUId = null;
					if (result.success && result.entity) {
						resultUId = result.entity.get("UId");
					}
					callback.call(scope, resultUId);
				}, this);
			},

			/**
			 * Возвращает уникальный идентификатор пакета.
			 * @protected
			 * @virtual
			 * @return Уникальный идентификатор пакета.
			 */
			getPackageUId: function() {
				return this.packageUId;
			},

			/**
			 * Заполняет значение уникального идентификатора пакета.
			 * @protected
			 * @overridden
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initPackageUId: function(callback, scope) {
				Terrasoft.chain(
					this.initPackageSysSettings,
					function(next, sysSettingsValues) {
						var currentPackageId = sysSettingsValues.CurrentPackageId;
						currentPackageId = (currentPackageId && currentPackageId.value) || null;
						if (currentPackageId && !(Terrasoft.isEmptyGUID(currentPackageId))) {
							this.getSysPackageUId(currentPackageId, function(packageUId) {
								this.packageUId = packageUId;
								next();
							}, this);
						} else {
							var customPackageUId = sysSettingsValues.CustomPackageUId;
							customPackageUId = (customPackageUId && customPackageUId.value) || null;
							if (customPackageUId && !(Terrasoft.isEmptyGUID(customPackageUId))) {
								this.packageUId = customPackageUId;
							}
							next();
						}
					},
					function(next) {
						Terrasoft.SchemaDesignerUtilities.getAvailablePackages(function(availablePackages) {
							var result = { success: true };
							if (!availablePackages[this.packageUId]) {
								var availablePackagesUIds = Ext.Object.getKeys(availablePackages);
								if (availablePackagesUIds.length > 0) {
									this.packageUId = availablePackagesUIds[0];
									var packageName = availablePackages[this.packageUId];
									result.message =
										Ext.String.format(this.getLocalizableStringValue("SetPackageNameInfo"),
											packageName);
								}
							}
							result.packageUId = this.packageUId;
							next(result);
						}, this);
					},
					function(next, result) {
						if (!this.packageUId || (Terrasoft.isEmptyGUID(this.packageUId))) {
							result.success = false;
							result.message = this.getLocalizableStringValue("CurrentPackageNotFound");
						}
						next(result);
					},
					function(next, result) {
						callback.call(scope, result);
					},
					this
				);
			}

		});

	});