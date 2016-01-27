define("IntroPageUtilities", ["terrasoft"], function(Terrasoft) {
	Ext.define("Terrasoft.configuration.IntroPageUtilities", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.IntroPageUtilities",

		singleton: true,

		/**
		 * Возвращает имя главной страницы по умолчанию.
		 * @param {Guid} defaultIntroPageId Значение Id для главной страницы по умолчанию.
		 * @param {Function} callback callback-функция.
		 * @param {Object} scope Контекст для выполнения.
		 */
		getDefaultIntroPageName: function(defaultIntroPageId, callback, scope) {
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "ApplicationMainMenu",
				serverESQCacheParameters: {
					cacheLevel: Terrasoft.ESQServerCacheLevels.SESSION,
					cacheGroup: "ApplicationMainMenu",
					cacheItemName: defaultIntroPageId
				}
			});
			esq.addColumn("[SysSchema:UId:IntroPageUId].Name", "Name");
			esq.getEntity(defaultIntroPageId, function(result) {
				var entity = result.entity;
				if (result.success && entity) {
					var defaultIntroPageName = entity.get("Name");
					callback.call(scope, defaultIntroPageName);
				}
			}, this);
		}
	});
	return Terrasoft.IntroPageUtilities;
});
