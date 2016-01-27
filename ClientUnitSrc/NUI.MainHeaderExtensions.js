/**
 * Расширения модуля шапки приложения. Используется для расширения модуля в дочерних пакетах.
 */
define("MainHeaderExtensions", ["ext-base"], function(Ext) {
	return {

		/**
		 * Дополнительно инициализирует модель представления шапки приложения.
		 * @param {Terrasoft.BaseViewModel} viewModel
		 */
		customInitViewModel: Ext.emptyFn,

		/**
		 * Расширяет свойства модели представления шапки приложения.
		 * @param {Object} values Существующие свойства модели.
		 */
		extendViewModelValues: Ext.emptyFn,

		/**
		 * Расширяет методы модели представления шапки приложения.
		 * @param {Object} methods Существующие методы модели.
		 */
		extendViewModelMethods: Ext.emptyFn,

		/**
		 * Расширяет контейнер изображения фотографии пользователя.
		 * @param {Terrasoft.Container} imageContainer Контейнер изображения фотографии пользователя.
		 */
		extendImageContainer: Ext.emptyFn
	};
});