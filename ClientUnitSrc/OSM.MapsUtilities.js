define("MapsUtilities", ["MapsHelper"], function(MapsHelper) {
	Ext.define("Terrasoft.configuration.MapsUtilities", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.MapsUtilities",

		singleton: true,

		/**
		 * Открывает OSM модуль карт.
		 * @param {Object} config.scope контекст для выполнения.
		 * @param {Object} config.sandbox песочница для обмена сообщениями.
		 * @param {Object} config.renderTo ссылка для отрисовки модуля.
		 * @param {Boolean} config.keepAlive признак открытия модуля по цепочке.
		 * @param {Array} config.mapsConfig входные данные для отображения на карте.
		 * @param {String} config.mapsModuleSandboxId идентификатор для модуля карт.
		 * @param {Function} config.afterRender пользовательская функция пост отрисовки модуля.
		 */
		open: function(config) {
			var scope = config.scope;
			var sandbox = config.sandbox || scope.sandbox;
			var renderTo = config.renderTo;
			var mapsConfig = config.mapsConfig;
			var afterRenderFunction = config.afterRender;
			var mapsModuleSandboxId = config.mapsModuleSandboxId || (sandbox.id + "_MapsModule");
			var keepAlive = config.keepAlive;
			if (Ext.isEmpty(renderTo)) {
				mapsModuleSandboxId += Terrasoft.generateGUID();
				keepAlive = true;
				mapsConfig.isModalBox = true;
			} else {
				mapsConfig.renderTo = renderTo;
			}
			MapsHelper.showMask();
			if (Ext.isFunction(afterRenderFunction)) {
				sandbox.subscribe("AfterRenderMap", function() {
					afterRenderFunction.call(scope);
				}, [mapsModuleSandboxId]);
			}
			sandbox.subscribe("GetMapsConfig", function() {
				return mapsConfig;
			}, [mapsModuleSandboxId]);
			sandbox.loadModule("OsmMapsModule", {
				id: mapsModuleSandboxId,
				keepAlive: keepAlive
			});
		}
	});
	return Terrasoft.MapsUtilities;
});