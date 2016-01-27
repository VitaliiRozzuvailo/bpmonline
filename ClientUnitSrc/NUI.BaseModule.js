define("BaseModule", ["ext-base"], function(Ext) {

	/**
	 * @class Terrasoft.configuration.BaseModule
	 * Базовый класс модуля
	 */
	Ext.define("Terrasoft.configuration.BaseModule", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.BaseModule",

		/**
		 * Идентификатор контейнера модуля.
		 * type {String}
		 */
		renderToId: null,

		/**
		 * Признак использования маски загрузки при загрузке модуля.
		 * type {Boolean}
		 */
		showMask: false,

		/**
		 * Идентификатор маски загрузки модуля.
		 * @private
		 * type {String}
		 */
		maskId: null,

		/**
		 * Параметры загрузки модуля.
		 * @type {Object}
		 * @protected
		 */
		parameters: null,

		/**
		 * Отображает маску загрузки модуля.
		 * @protected
		 */
		showLoadingMask: function() {
			if (this.showMask && this.renderToId) {
				this.maskId = Terrasoft.Mask.show({
					selector: Ext.String.format("#{0}", this.renderToId)
				});
			}
		},

		/**
		 * Скрывает маску загрузки модуля.
		 * @protected
		 */
		hideLoadingMask: function() {
			if (this.maskId && this.showMask) {
				Terrasoft.Mask.hide(this.maskId);
				this.maskId = null;
			}
		},

		/**
		 * @inheritDoc Terrasoft.core.BaseObject#init
		 * @overridden
		 */
		init: function() {
			this.showLoadingMask();
		},

		/**
		 * Запускает процесс рендеринга модуля.
		 */
		render: function() {
			this.hideLoadingMask();
		},

		/**
		 * @inheritDoc Terrasoft.core.BaseObject#onDestroy
		 * @overridden
		 */
		onDestroy: function() {
			this.hideLoadingMask();
			this.callParent(arguments);
		}

	});

	return Terrasoft.BaseModule;
});
