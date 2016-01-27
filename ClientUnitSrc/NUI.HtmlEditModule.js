define("HtmlEditModule", ["ext-base", "terrasoft", "HtmlEditModuleResources", "ckeditor-base"],
	function(Ext, Terrasoft, resources) {
		Ext.ns("Terrasoft.controls.HtmlEdit");
		/**
		 * @class Terrasoft.controls.HtmlEdit
		 * Класс контрола текстового редактора
		 */ 
		Ext.define("Terrasoft.controls.HtmlEdit", {
			extend: "Terrasoft.Container",
			alternateClassName: "Terrasoft.HtmlEdit",

			/**
			 * Шрифт по умолчанию.
			 * @type {String}
			 */
			defaultFontFamily: "Segoe UI",

			/**
			 * Признак обязательности.
			 * @type {Boolean}
			 */
			isRequired: false,

			/**
			 * Объект, содержащий сведения о валидности значения в элементе управления.
			 * @protected
			 * @type {Object}
			 */
			validationInfo: null,

			/**
			 * Css-класс для элемента управления когда он не прошел проверку.
			 * @type {String}
			 */
			errorClass: "base-edit-error",

			/**
			 * Шрифты.
			 * @type {String}
			 */
			fontFamily: "Verdana,Times New Roman,Courier New,Arial,Tahoma,Arial Black,Comic Sans MS",

			/**
			 * Размер шрифта по умолчанию.
			 * @type {String}
			 */
			defaultFontSize: "14",

			/**
			 * Размеры шрифтов.
			 * @type {String}
			 */
			fontSize: "8,9,10,11,12,14,16,18,20,22,24,26,28,36,48,72",

			/**
			 * Цвет шрифта по умолчанию.
			 * @type {String}
			 */
			defaultFontColor: "#000000",

			/**
			 * Цвет фона по умолчанию.
			 * @type {String}
			 */
			defaultBackground: "#ffffff",

			/**
			 * Цвет фона по умолчанию.
			 * @type {String}
			 */
			defaultHighlight: "#ffffff",

			/**
			 * Стиль кнопок по умолчанию.
			 * @type {Terrasoft.controls.ButtonEnums.style}
			 */
			defaultButtonStyle: Terrasoft.controls.ButtonEnums.style.DEFAULT,

			/**
			 * Значение.
			 * @type {String}
			 */
			value: "",

			/**
			 * Значение без Html тегов.
			 * @type {String}
			 */
			plainTextValue: "",

			/**
			 * Ссылка на редактор.
			 * @type {Object}
			 */
			editor: null,

			/**
			 * Значение
			 * @type {String}
			 */
			controlElementPrefix: "html-edit",

			/**
			 * Режим обычного текста.
			 * @type {Boolean}
			 */
			plainTextMode: false,

			/**
			 * Разрешение запрашивать у пользователя подтверждение при включении текстового режима редактирования.
			 * @type {Boolean}
			 */
			showChangeModeConfirmation: true,

			/**
			 * Указывает на необходимость скрыть кнопки переключения режима елемента управления.
			 * @type {Boolean}
			 */
			hideModeButtons: false,

			/**
			 * Ширина контрола.
			 * @type {String}
			 */
			width: "100%",

			/**
			 * Высота контрола.
			 * @type {String}
			 */
			height: "350px",

			/**
			 * Отступ вокруг контрола.
			 * @type {String}
			 */
			margin: "0px 0px 0px 0px",

			/**
			 * Активность контрола.
			 * @type {Boolean}
			 */
			enabled: true,

			/**
			 * Картинки.
			 * @type {Terrasoft.Collection}
			 */
			images: null,

			/**
			 * Конфигурация контрола.
			 * @private
			 * @static
			 * @type {Object}
			 */
			tplData: {
				classes: {
					htmlEditClass: ["html-editor"],
					htmlEditToolbarClass: ["html-edit-toolbar"],
					htmlEditToolbarTopClass: ["html-edit-toolbar-top"],
					htmlEditToolbarButtonGroupClass: ["html-edit-toolbar-buttongroup"],
					htmlEditTextareaClass: ["html-edit-textarea", "onhtml-edit-textarea"]
				},
				styles: {
					htmlEditStyle: {
						width: this.width,
						height: this.height,
						margin: this.margin
					},
					htmlEditFontFamilyStyle: {
						"vertical-align": "top",
						width: "165px"
					},
					htmlEditFontSizeStyle: {
						"vertical-align": "top",
						width: "68px"
					}
				}
			},

			/**
			 * Панель управления контрола.
			 * @private
			 * @static
			 * @type {Object}
			 */
			toolbar: null,

			/**
			 * Ссылка на элемент-обертку панели управления.
			 * @private
			 * @type {Ext.Element}
			 */
			toolbarEl: null,

			/**
			 * Текстовый контрол.
			 * @private
			 * @static
			 * @type {Object}
			 */
			memo: null,

			/**
			 * Общий шаблон контрола, содержит разметку элементов и метод для рендеринга контнента.
			 * @overridden
			 * @type {Array}
			 */
			tpl: [
				/*jshint quotmark: false */
				'<div id="{id}-html-edit" class="{htmlEditClass}" style="{htmlEditStyle}">',
				'<div style="display: table-row;">',
				'<div id="{id}-html-edit-toolbar" class="{htmlEditToolbarClass}">',
				'<div id="html-edit-toolbar-font-family" class="{htmlEditToolbarButtonGroupClass}" style="{htmlEditFo' +
				'ntFamilyStyle}">',
				'<tpl for="items">',
				'<tpl if="tag == \'fontFamily\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-font-size" class="{htmlEditToolbarButtonGroupClass}" style="{htmlEditFont' +
				'SizeStyle}">',
				'<tpl for="items">',
				'<tpl if="tag == \'fontSize\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-font-style" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'fontStyleBold\' || tag == \'fontStyleItalic\' || tag == \'fontStyleUnderline\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-font-color" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'fontColor\'">',
				'	<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-highlight" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'hightlightColor\'">',
				'	<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-list" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'numberedList\' || tag == \'bulletedList\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-justify" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'justifyLeft\' || tag == \'justifyCenter\' || tag == \'justifyRight\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-image" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'image\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-link" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'link\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-justify" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'htmlMode\' || tag == \'plainMode\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'</div>',
				'</div>',
				'<div style="display: table-row;">',
				'<div id="{id}-html-edit-htmltext" class="{htmlEditTextareaClass}">',
				'<textarea id="{id}-html-edit-textarea" style="border: none"></textarea>',
				'</div>',
				'<div id="{id}-html-edit-plaintext" class="{htmlEditTextareaClass}" style="border: none; margin-bottom: 24px;">',
				'<tpl for="items">',
				'<tpl if="tag == \'plainText\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'</div>',
				'<span id="{id}-validation" class="{validationClass}" style="{validationStyle}">' +
				'{validationText}</span>',
				'</div>'
				/*jshint quotmark: true */
			],

			/**
			 * Массив елементов управления контрола.
			 * @overridden
			 * @type {Array}
			 */
			items: null,

			/**
			 * Конфигурация елементов управления.
			 * @overridden
			 * @type {Array}
			 */
			itemsConfig: [
				{
					className: "Terrasoft.ComboBoxEdit",
					tag: "fontFamily"
				},
				{
					className: "Terrasoft.ComboBoxEdit",
					tag: "fontSize"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MUUyMkFDMkY5MDlDMTFFMkI3M" +
						"DU5QTIzNkQwM0IyNUUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MUUyMkFDMzA5MDlDMTFFMkI3MDU5QTIzNkQwM" +
						"0IyNUUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxRTIyQUMyRDkwOUMxMUUyQ" +
						"jcwNTlBMjM2RDAzQjI1RSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxRTIyQUMyRTkwOUMxMUUyQjcwNTlBMjM2R" +
						"DAzQjI1RSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/Pvb0WzQAAAB4SURBVHjaYvz//z8DJYBx8BmQl5dXDqQ6sKitAOLOSZMmoQgykWAZyNBydEF8BpwFuRCIhYD4HlTMm" +
						"BQDsIHV6AIseBSDbIMF0HsgTsdmALEuEATimUCcRk4YgPAspICkKAwYyA0DGNhDiQs6gThsCOQFUgFAgAEA6lsmpZrdg" +
						"90AAAAASUVORK5CYII="
					},
					handler: function() {
						var container = this.ownerCt;
						var editor = container.editor;
						if (editor) {
							editor.execCommand("bold");
						}
					},
					tag: "fontStyleBold"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjREQzU3NjE5MDlDMTFFMjg3N" +
						"jdFMTJCRDUxQjVFRjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MjREQzU3NjI5MDlDMTFFMjg3NjdFMTJCRDUxQ" +
						"jVFRjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyNERDNTc1RjkwOUMxMUUyO" +
						"Dc2N0UxMkJENTFCNUVGMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyNERDNTc2MDkwOUMxMUUyODc2N0UxMkJEN" +
						"TFCNUVGMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/Pou8qywAAAB6SURBVHjaYvz//z8DJYBx8BmQl5eHzC0H4jQoe9akSZM60Q1gImDBeyAWBOLVUIwBWIgwAAQ6kdgku" +
						"cAYiO/h0kyMAaG4nE6MASDblYB4D7kGuECdf5ZcAwg6H58BxlB8lhwDQInnDJTdQcgAbOlgFpLT3w/+zAQQYABagCf8o" +
						"BPPXwAAAABJRU5ErkJggg=="
					},
					handler: function() {
						var container = this.ownerCt;
						var editor = container.editor;
						if (editor) {
							editor.execCommand("italic");
						}
					},
					tag: "fontStyleItalic"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzA4QTRCN0E5MDlDMTFFMkI1M" +
						"TRFMzcxRUVCM0U3RjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzA4QTRCN0I5MDlDMTFFMkI1MTRFMzcxRUVCM" +
						"0U3RjUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozMDhBNEI3ODkwOUMxMUUyQ" +
						"jUxNEUzNzFFRUIzRTdGNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozMDhBNEI3OTkwOUMxMUUyQjUxNEUzNzFFR" +
						"UIzRTdGNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/PuosCNQAAABzSURBVHjaYvz//z8DJYBxcBmQl5cHosqBuAMkh6bWBYh3g8QnTZoEF2RioBCMGkAjA+5BaWM0cRD/L" +
						"DEG7IEaMhOIlZDSACh9zCLGgPdAHAZl3wViUEpbBcSd2AxgweE1kFNN6BKI6C5IgGJCwAHGAAgwADMLHb9RAqpSAAAAA" +
						"ElFTkSuQmCC"
					},
					handler: function() {
						var container = this.ownerCt;
						var editor = container.editor;
						if (editor) {
							editor.execCommand("underline");
						}
					},
					tag: "fontStyleUnderline"
				},
				{
					className: "Terrasoft.ColorButton",
					simpleMode: false,
					defaultValue: "#000000",
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAgklEQVR42u2SPQrA" +
							"IAyFPbCjq6t7J1dXR8/gETxQylewtCD+QbcGHoboe0lMlPrSjDECtsg554ustRb8ZQHvvYQQhBMsC9TMAH+JnFJ" +
							"69Y5PbFrAOScxxptAK8SmyKWUg5Jb4G4oQGZrrbRG+qyqO/vWQ2LDnag/3iq1tra1E7/17QRe1HY6DA0erQAAAA" +
							"BJRU5ErkJggg=="
					},
					tag: "fontColor"
				},
				{
					className: "Terrasoft.ColorButton",
					simpleMode: true,
					defaultValue: "#ffffff",
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABHUlEQVR42mPY++L3f" +
							"0owA9UNaOqd9L+lrf3/03cf4WLltfX/t+3a8//i62/4Ddh0/cX/opLS/6Wlpf8vXb32//jLn6QZMH3djv/902b9n" +
							"zR95v+FK1b/v/HmK9yAeQsW/i8GGpyTk/O/v7///6O3nzANqGnt/L/38NH/aw+c/F8MdMmb9x/gBrQCvXX36Yv/W" +
							"68/B7ty5+7dYBfBDVh7/h5YAqapsKTs/6kzZ/+fevUDbMC6jZv/X3kNcVH71Dn/Zy1Y9P/2my8IAyYtWw92HjJes" +
							"GABWBF6GIAMgHkRbgDIxoOHj/w/9+o7mL/8+FWwix4/e47ihfVAl4IMP3PmDNh1YAMW7T+N4mf06KusrfvfCww4d" +
							"JdRJyGNAsoBAPPZRpvh9VREAAAAAElFTkSuQmCC"
					},
					tag: "hightlightColor"
				},
				{
					className: "Terrasoft.Button",

					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTEwN0RDODY5MDlDMTFFMkIzO" +
						"Tc4OUMwNkIxRDEzRUIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTEwN0RDODc5MDlDMTFFMkIzOTc4OUMwNkIxR" +
						"DEzRUIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5MTA3REM4NDkwOUMxMUUyQ" +
						"jM5Nzg5QzA2QjFEMTNFQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5MTA3REM4NTkwOUMxMUUyQjM5Nzg5QzA2Q" +
						"jFEMTNFQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/PlEf/lMAAACTSURBVHjaYszNzWUAggIgDgBih0mTJjGQApigtAADmYAFSjcA8QF0yby8vP/EGoALMBLrBRBwoMQLW" +
						"AExAQpygQIQX4BiBVJdADLgAzQKHwCxATleABkwAUpvIDUWQC5IQHKBA5ZYwItBLlgAxQwDHgsPKIkFWCCS5QUBqO2wQ" +
						"FxAal4QgLqAAeoV5DAgmBcAAgwAG7UkpS8YIAMAAAAASUVORK5CYII="
					},
					handler: function() {
						var container = this.ownerCt;
						var editor = container.editor;
						if (editor) {
							editor.execCommand("numberedlist");
						}
					},
					tag: "numberedList"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUY3QjFENDc5MDlDMTFFMkIyQ" +
						"jZEMDAwRDEzMDRFNjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUY3QjFENDg5MDlDMTFFMkIyQjZEMDAwRDEzM" +
						"DRFNjQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5RjdCMUQ0NTkwOUMxMUUyQ" +
						"jJCNkQwMDBEMTMwNEU2NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5RjdCMUQ0NjkwOUMxMUUyQjJCNkQwMDBEM" +
						"TMwNEU2NCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/PhfrCd8AAABFSURBVHjaYvz//z8DJYARZEBeXh7MFMZJkyaRZAALNkEkA/ECoGWMMAMY0V1GrAuYGCgEjFQJxNFYG" +
						"I0FSmOBYi8ABBgAsR0zC1Ifrk0AAAAASUVORK5CYII="
					},
					handler: function() {
						var container = this.ownerCt;
						var editor = container.editor;
						if (editor) {
							editor.execCommand("bulletedlist");
						}
					},
					tag: "bulletedList"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTlBRDNEMTc5MDlDMTFFMjkxN" +
						"TdDRjFFRkQ3QTgxOEUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTlBRDNEMTg5MDlDMTFFMjkxNTdDRjFFRkQ3Q" +
						"TgxOEUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBOUFEM0QxNTkwOUMxMUUyO" +
						"TE1N0NGMUVGRDdBODE4RSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBOUFEM0QxNjkwOUMxMUUyOTE1N0NGMUVGR" +
						"DdBODE4RSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/Pq9NSeIAAABHSURBVHjaYvz//z8DJYCRKgbk5eWRZcqkSZMYWUAMWVlZRnJdwMRAIQC74PHjx0R5AeTS0tJSTAMG1" +
						"AujsTAsYoHi3AgQYACNoyozyMv+kwAAAABJRU5ErkJggg=="
					},
					handler: function() {
						var container = this.ownerCt;
						var editor = container.editor;
						if (editor) {
							editor.execCommand("justifyleft");
						}
					},
					tag: "justifyLeft"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjNFM0EyQzM5MDlDMTFFMjhFR" +
						"jVBQ0U5RjU1OEIzQkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjNFM0EyQzQ5MDlDMTFFMjhFRjVBQ0U5RjU1O" +
						"EIzQkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCM0UzQTJDMTkwOUMxMUUyO" +
						"EVGNUFDRTlGNTU4QjNCRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCM0UzQTJDMjkwOUMxMUUyOEVGNUFDRTlGN" +
						"TU4QjNCRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/PrcK9twAAABTSURBVHjaYvz//z8DJYCRKgbk5eWRZcqkSZMYWUAMWVlZRnJdwMRAIUAJA2K9AnI6jA32Qnd3NwO5X" +
						"qGOF0Z4LIANgMUCMaC0tHSQxQLFuREgwABgSzSs1jl5JgAAAABJRU5ErkJggg=="
					},
					handler: function() {
						var container = this.ownerCt;
						var editor = container.editor;
						if (editor) {
							editor.execCommand("justifycenter");
						}
					},
					tag: "justifyCenter"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzBBMTg3MzI5MDlDMTFFMkEwM" +
						"TU5RjhGM0FEMEI4QUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzBBMTg3MzM5MDlDMTFFMkEwMTU5RjhGM0FEM" +
						"EI4QUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMEExODczMDkwOUMxMUUyQ" +
						"TAxNTlGOEYzQUQwQjhBRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMEExODczMTkwOUMxMUUyQTAxNTlGOEYzQ" +
						"UQwQjhBRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/PlDMaHUAAABRSURBVHjaYvz//z8DJYCRKgbk5eWRZcqkSZMYWUAMWVlZRnJdwMRAIcAIg+7ubobHjx//J8kL6IAUL" +
						"1HsBbALyI0FUBCMxsJgiAWKcyNAgAEASngqCR1xadsAAAAASUVORK5CYII="
					},
					handler: function() {
						var container = this.ownerCt;
						var editor = container.editor;
						if (editor) {
							editor.execCommand("justifyright");
						}
					},
					tag: "justifyRight"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzdDODRFREY5MDlDMTFFMkJEM" +
						"DRGMkY1QTYwNTYwNzQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzdDODRFRTA5MDlDMTFFMkJEMDRGMkY1QTYwN" +
						"TYwNzQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDN0M4NEVERDkwOUMxMUUyQ" +
						"kQwNEYyRjVBNjA1NjA3NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDN0M4NEVERTkwOUMxMUUyQkQwNEYyRjVBN" +
						"jA1NjA3NCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/PgMDb18AAAC+SURBVHjaYpw9ezYDKYCJgURAsgYWPHLR0dGcnJz79u65d/8BYRucnZ2AqoEMJ2cXopz04f0HKOPDB" +
						"3xOAhqgoKR47979s+fOAbnsHOzHjh3HpyE8PJybl1dQ4BxQA0QPvlAKCAgAqgYyDI2MpKUkgAwtLU0rK0vsNnh6eoqIi" +
						"CC4Xj7Hjh21srIGsn/++Am3jQkWJs5SUlJotkNUQyxUUlJE0aCoqMjIyIgnTuzs7FGcNGfOnEGTlkjWABBgAESFMSI5C" +
						"hAqAAAAAElFTkSuQmCC"
					},
					fileUpload: true,
					tag: "image"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDFEOTc4NTc5MDlDMTFFMkI3M" +
						"DJCNDA4RTBFN0M3MkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDFEOTc4NTg5MDlDMTFFMkI3MDJCNDA4RTBFN" +
						"0M3MkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEMUQ5Nzg1NTkwOUMxMUUyQ" +
						"jcwMkI0MDhFMEU3QzcyQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEMUQ5Nzg1NjkwOUMxMUUyQjcwMkI0MDhFM" +
						"EU3QzcyQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/Po4DONkAAAFaSURBVHjahFO9boMwEL4ixIZUiQW2dICJId2YUCrxArxB+gTpq3RmaPIEoTNLxcREM8ACS5iYQB1YY" +
						"KoP2chYTvJJJ7B9P9+dPz9FUQQC9sQOxLbC/g+xE7Ejv6lw/xjwS+xLEozY0TP02bBNlQs+h2G40TQNhmFYRWZZBl3Xi" +
						"YVeiV0ZgzMuyrKEvu/BsqzF6rqeg3Vd53M+05i5hQ9KaVdVFSRJAtM0LZ6e54HjOEDYiUmQyV6hA1uBowvYku/789e2b" +
						"dH1oPADYWjbdrVGRsgsz3PRdatKpg1FUYDrujCOIzRNMyfErwzSBKwi9oxzuQf11gFWZa3gIA3DEK9zEdIFHgDbwSsNg" +
						"kA8ijHB56MEjAm2hLfB4Vuh2r7LAsXEFMlpBN/GkSnxndjfrQSmac7DxNuhQN+Qf0wXqm0pE5R4mqZ85RdWkH+NV5oE2" +
						"cQSZcb07I1n+y/AAMBAh+gKYFCSAAAAAElFTkSuQmCC"
					},
					handler: function() {
						var container = this.ownerCt;
						if (container) {
							container.showLinkInputBox();
						}
					},
					tag: "link"
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjMwNkMyOUI5MTZCMTFFMjgyQ" +
						"0JCRTA4Mjk0QTEyODkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjMwNkMyOUM5MTZCMTFFMjgyQ0JCRTA4Mjk0Q" +
						"TEyODkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCMzA2QzI5OTkxNkIxMUUyO" +
						"DJDQkJFMDgyOTRBMTI4OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCMzA2QzI5QTkxNkIxMUUyODJDQkJFMDgyO" +
						"TRBMTI4OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/Pvt7gXwAAAEdSURBVHjaxFOhjgIxEO02aBIEEgQrwZVgMavPgTu7YFag+AXQa+74BOqwXHL+Ag594uwlNOEHljfkl" +
						"TQ1JEDCJC9tZ+bNvJnNJlVVqUdMq2dbURQLoHGXAhAzHHMgu3eEPDpvWhJ0F9lbwAEGSMuydGFy7+MnZ+wXWB2mA6ej7" +
						"pZoxCpA3nE0y3MbjzACvpjg+Pbkju+Mrj7HiF9TvmFXQ6JINFyqAkneKbAEKQuXrIPuexYwvKtQBe+7KK4SLk8C/XBp8" +
						"ItPpKff3XfpuAbGUGO5zE+JaS853niwzBG7Ko6mWPiq4Mi7LGciheDL+RWE6P7r7c2hNXxj3p6FLmPXRLqvFqiwLHix5" +
						"ulP/DOSrHx/jLEUJcnL/8azAAMA90ppEQp9yE4AAAAASUVORK5CYII="
					},
					handler: function() {
						var container = this.ownerCt;
						if (container) {
							container.changeEditorMode(false);
						}
					},
					tag: "htmlMode",
					markerValue: "htmlMode",
					disabledClass: ""
				},
				{
					className: "Terrasoft.Button",
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
					imageConfig: {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZ" +
						"QBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i7" +
						"7u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0Y" +
						"S8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgI" +
						"CAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtb" +
						"nMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhc" +
						"C8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0d" +
						"HA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgU" +
						"GhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzZEQkFBMUI5MTZCMTFFMjkyO" +
						"TJCREE1NDg0MzEwNzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzZEQkFBMUM5MTZCMTFFMjkyOTJCREE1NDg0M" +
						"zEwNzciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDNkRCQUExOTkxNkIxMUUyO" +
						"TI5MkJEQTU0ODQzMTA3NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDNkRCQUExQTkxNkIxMUUyOTI5MkJEQTU0O" +
						"DQzMTA3NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0ic" +
						"iI/PvMTT+oAAABiSURBVHjaYvz//z8DJYBxcBiQl5eHLg4ylZGQ5kmTJjEwYRGHaSbKaUwMFAIWEtUju4oRmwuQ/Y7NG" +
						"4xI+D/VvfAfizPRXfWfUBgw4vE3etRS1wv4Eg4jvrTBOPQzE0CAAQBhVikKBa4ILAAAAABJRU5ErkJggg=="
					},
					handler: function() {
						var container = this.ownerCt;
						if (container) {
							if (!container.showChangeModeConfirmation) {
								container.changeEditorMode(true);
							} else {
								Terrasoft.utils.showConfirmation(resources.localizableStrings.ConfirmPlainTextMode,
									function(returnCode) {
										if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
											container.changeEditorMode(true);
										}
									},
									["yes", "no"], this
								);
							}
						}
					},
					tag: "plainMode",
					markerValue: "plainMode",
					disabledClass: ""
				},
				{
					className: "Terrasoft.MemoEdit",
					width: "100%",
					height: "100%",
					tag: "plainText"
				}
			],

			/**
			 * Задержка перед установкой значения.
			 * Количество миллисекунд, которое должно пройти после того как пользователь ввел значение в элемент и
			 * установкой значения.
			 * @protected
			 * @type {Number}
			 */
			setValueDelay: 250,

			/**
			 * Инициализация контрола.
			 * @protected
			 * @overridden
			 */
			init: function() {
				if (!this.validationInfo) {
					this.validationInfo = {
						isValid: true,
						invalidMessage: ""
					};
				}
				this.items = Terrasoft.deepClone(this.itemsConfig);
				this.callParent(arguments);
				this.selectors = {
					wrapEl: ""
				};
				this.images = Ext.create("Terrasoft.Collection");
				this.addEvents(
					/*
					 * @event changeTypedValue
					 */
					"imageLoaded",
					/**
					 * @event focus
					 * Срабатывает когда элемент получает фокус.
					 */
					"focus",
					/**
					 * @event blur
					 * Срабатывает когда элемент теряет фокус.
					 */
					"blur"
				);
			},

			/**
			 * Инициализирует подписку на DOM-события элемента управления.
			 * @overridden
			 * @protected
			 */
			initDomEvents: function() {
				this.callParent(arguments);
				var applyColorStyles = function(color, self, isForBackground) {
					var useFor = (isForBackground) ? "defaultHighlight" : "defaultFontColor";
					var container = self.ownerCt;
					if (container) {
						if (color) {
							container[useFor] = color;
						}
						if (isForBackground) {
							container.applyFontStyleBackgroundColor();
						} else {
							container.applyFontStyleColor();
						}
					}
				};
				var items = this.items.items;
				var fontColorButton = items[5];
				var backgroundColorButton = items[6];
				fontColorButton.on("change", function(color) {
					applyColorStyles(color, this);
				}, fontColorButton);
				fontColorButton.button.on("click", function() {
					applyColorStyles(null, this);
				}, fontColorButton);
				backgroundColorButton.on("change", function(color) {
					applyColorStyles(color, this, true);
				}, backgroundColorButton);
				backgroundColorButton.button.on("click", function() {
					applyColorStyles(null, this, true);
				}, backgroundColorButton);
				var validationInfo = this.validationInfo;
				if (!validationInfo.isValid) {
					this.showValidationMessage(validationInfo.invalidMessage);
				}
			},

			/**
			 * Вычисляет стили для элемента управления на основании конфигурации.
			 * @protected
			 * @return {Object} Строка содержащая список CSS - классов.
			 */
			combineClasses: function() {
				var classes = {
					validationClass: ["html-edit-validation"]
				};
				var wrapClass = classes.wrapClass;
				if (!this.validationInfo.isValid) {
					wrapClass.push("html-edit-error");
				}
				return classes;
			},

			/**
			 * Метод инициализирует стили для шаблона элемента управления.
			 * @protected
			 * @return {Object} Объект, содержащий стили.
			 */
			combineStyles: function() {
				var styles = {
					wrapStyle: {},
					inputStyle: {},
					validationStyle: {}
				};
				var validationStyle = styles.validationStyle;
				if (!this.validationInfo.isValid) {
					validationStyle.display = "block";
				}
				return styles;
			},

			/**
			 * Метод возвращает селекторы элемента управления.
			 * @protected
			 * @return {Object} Объект селекторов.
			 */
			combineSelectors: function() {
				var id = "#" + this.id + "-";
				return {
					wrapEl: id + this.controlElementPrefix,
					el: id + this.controlElementPrefix + "-el",
					toolbarEl: id + this.controlElementPrefix + "-toolbar",
					validationEl: id + "validation"
				};
			},

			/**
			 * Добавляет CSS класс элементу управления в зависимости от флага isValid:
			 * если isValid установлен в true, то убирается класс сигнализирующий о ошибке,
			 * если isValid установлен в false, то добавляется класс сигнализирующий о ошибке.
			 * @protected
			 */
			setMarkOut: function() {
				if (!this.rendered) {
					return;
				}
				var validationEl = this.getValidationEl();
				if (!validationEl) {
					return;
				}
				var wrap = this.getWrapEl();
				var errorClass = this.errorClass;
				var validationInfo = this.validationInfo;
				validationEl.setStyle("width", "");
				if (!validationInfo.isValid) {
					wrap.addCls(errorClass);
					this.showValidationMessage(validationInfo.invalidMessage);
				} else {
					wrap.removeCls(errorClass);
					this.showValidationMessage("");
				}
				var wrapWidth = wrap.getWidth();
				var wrapHeight = wrap.getHeight();
				var validationElWidth = validationEl.getWidth();
				if (validationElWidth > wrapWidth) {
					validationEl.setWidth(wrapWidth);
				}
				validationEl.setTop(wrapHeight);
				validationEl.setVisible(!validationInfo.isValid);
			},

			/**
			 * Устанавливает для элемента управления информацию о результате валидации.
			 * @virtual
			 * @protected
			 */
			setValidationInfo: function(info) {
				if (this.validationInfo === info) {
					return;
				}
				this.validationInfo = info;
				this.setMarkOut();
			},

			/**
			 * Метод возвращает ссылку на текстовый DOM-элемент валидации компонента (см. {@link #el el}).
			 * @return {Ext.Element}
			 */
			getValidationEl: function() {
				return this.validationEl;
			},

			/**
			 * Метод вставляет текст валидации в DOM-элемент валидации компонента (см. {@link #el el}).
			 * @return {Ext.Element}
			 */
			showValidationMessage: function(massage) {
				this.validationEl.dom.innerHTML = massage;
			},

			/**
			 * Уничтожение элемента управления.
			 * @protected
			 * @override
			 */
			destroy: function() {
				if (this.editor) {
					this.editor.destroy();
				}
				if (this.images) {
					this.images.un("dataLoaded", this.onImagesLoaded, this);
					this.images.un("add", this.onAddImage, this);
				}
				if (this.memo) {
					this.memo.un("blur", this.onMemoBlur, this);
					delete this.demo;
				}
				if (this.toolbar) {
					delete this.toolbar;
				}
				this.callParent(arguments);
			},

			/**
			 * Рассчитывает данные для темплейта.
			 * @protected
			 * @overridden
			 * throws {Terrasoft.ItemNotFoundException}
			 * При условии, если среди конфигураций не будет найдена подходящая конфигурация, то
			 * будет сгенерирована ошибка, которая будет обработана в XTemplate, поэтому едиственный способ обнаружить
			 * эту ошибку - посмотреть в логах.
			 */
			getTplData: function() {
				var tplData = this.callParent(arguments);
				var controlTplData = this.tplData;
				var classes = controlTplData.classes;
				var styles = controlTplData.styles;
				var htmlEditStyle = styles.htmlEditStyle;
				if (this.height) {
					htmlEditStyle["height"] = this.height;
				}
				if (this.width) {
					htmlEditStyle["width"] = this.width;
				}
				if (this.margin) {
					htmlEditStyle["margin"] = this.margin;
				}
				tplData.htmlEditClass = classes.htmlEditClass;
				tplData.htmlEditToolbarClass = classes.htmlEditToolbarClass;
				tplData.htmlEditToolbarTopClass = classes.htmlEditToolbarTopClass;
				tplData.htmlEditToolbarButtonGroupClass = classes.htmlEditToolbarButtonGroupClass;
				tplData.htmlEditTextareaClass = classes.htmlEditTextareaClass;
				tplData.htmlEditStyle = styles.htmlEditStyle;
				tplData.htmlEditFontFamilyStyle = styles.htmlEditFontFamilyStyle;
				tplData.htmlEditFontSizeStyle = styles.htmlEditFontSizeStyle;
				Ext.apply(tplData, this.combineClasses(), {});
				this.styles = this.combineStyles();
				this.selectors = this.combineSelectors();
				return tplData;
			},

			/**
			 * Обработчик события "afterrender".
			 * @protected
			 * @overridden
			 */
			onAfterRender: function() {
				this.callParent(arguments);
				this.initControls();
				this.initCKEDITOR();
			},

			/**
			 * Обработчик события "afterrerender".
			 * @protected
			 * @overridden
			 */
			onAfterReRender: function() {
				this.callParent(arguments);
				this.initControls();
				this.initCKEDITOR();
			},

			/**
			 * Возвращает конфигурацию привязки к модели. Реализует интерфейс миксина {@link Terrasoft.Bindable}.
			 * @protected
			 * @overridden
			 */
			getBindConfig: function() {
				var bindConfig = this.callParent(arguments);
				var editorBindConfig = {
					value: {
						changeMethod: "onChangeValue",
						changeEvent: "changeValue",
						validationMethod: "setValidationInfo"
					},
					plainTextValue: {
						changeEvent: "changePlainTextValue"
					},
					plainTextMode: {
						changeMethod: "onChangePlainTextMode",
						changeEvent: "changePlainTextMode"
					},
					enabled: {
						changeMethod: "onChangeEnabled",
						changeEvent: "changeEnabled"
					},
					focused: {
						changeEvent: "focusChanged"
					},
					images: {
						changeMethod: "onImagesLoaded"
					}
				};
				Ext.apply(editorBindConfig, bindConfig);
				return editorBindConfig;
			},

			/**
			 * Обработчик события "onChangeValue".
			 * @protected
			 * @param {String} value Устанавливаемое значение.
			 */
			onChangeValue: function(value) {
				this.setValue(value);
			},

			/**
			 * Обработчик события "onChangePlainTextMode".
			 * @protected
			 * @param {String} value Устанавливаемое значение.
			 */
			onChangeEnabled: function(value) {
				this.setEnabled(value);
			},

			/**
			 * Обработчик события "onChangePlainTextMode".
			 * @protected
			 * @param {String} value Устанавливаемое значение.
			 */
			onChangePlainTextMode: function(value) {
				this.changeEditorMode(value);
			},

			/**
			 * Устанавливает положение курсора для вставки элементов в документ.
			 * @private
			 */
			fixCursorInitPosition: function() {
				if (this.value) {
					return;
				}
				var editor = this.editor;
				var editorDocument = editor.document;
				var target = editorDocument.getBody().$;
				var range = new CKEDITOR.dom.range(editorDocument);
				range.setStart(new CKEDITOR.dom.node(target), 0);
				range.collapse();
				var selection = editor.getSelection();
				selection.selectRanges([range]);
				editor.focus();
			},

			/**
			 * Устанавливает значение параметра Value.
			 * private
			 * @param {String} value Устанавливаемое значение.
			 */
			setValue: function(value) {
				var memo = this.memo;
				var editor = this.editor;
				if (editor && memo) {
					if (this.plainTextMode) {
						memo.setValue(value);
						memo.setScrollHeight();
					} else {
						var editorData = "";
						try {
							editorData = editor.getData();
						} catch (e) {
							var editorDocument = editor.document;
							var editorDocumentBody = editorDocument.getBody();
							editorData = editorDocumentBody.$.innerHTML;
						}
						if (value !== editorData) {
							var setDataTask = new Ext.util.DelayedTask(function() {
								editor.setData(value);
								var textarea = Ext.get(editor.name);
								if (textarea) {
									textarea.set({"dataset": "true"});
								}
							});
							setDataTask.delay(this.setValueDelay);
						}
					}
				}
				if (this.value !== value) {
					this.value = value;
					this.fireEvent("changeValue", this.value, this);
					this.plainTextValue = this.value && this.removeHtmlTags(this.value);
					this.fireEvent("changePlainTextValue", this.plainTextValue, this);
				}
			},

			/**
			 * Получает значение элемента управления.
			 * @protected
			 */
			getEditorValue: function() {
				var editor = this.editor;
				if (!this.editor) {
					return this.value;
				}
				if (this.plainTextMode) {
					var plainText = editor.getData();
					return this.removeHtmlTags(plainText);
				} else {
					return editor.getData();
				}
			},

			/**
			 * Открывает диалог вставки ссылки.
			 * @protected
			 */
			showLinkInputBox: function() {
				var me = this;
				var editor = this.editor;
				var selection = editor.getSelection();
				var selectedText = selection.getSelectedText() || "";
				Terrasoft.utils.inputBox(
					resources.localizableStrings.HyperlinkDialogCaption,
					me.insertHyperLink,
					["ok", "cancel"],
					this,
					{
						link: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							caption: resources.localizableStrings.HyperlinkAddress
						},
						linkText: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							caption: resources.localizableStrings.HyperlinkText,
							value: selectedText
						}
					},
					{
						defaultButton: 0
					}
				);
			},

			/**
			 * Обработчик закрытия.
			 * @protected
			 */
			insertHyperLink: function(returnCode, controlData) {
				if (returnCode === "ok") {
					var link = controlData["link"].value;
					var linkText = controlData["linkText"].value || link;
					var editor = this.editor;
					this.fixCursorInitPosition();
					if (link) {
						var attributes = {};
						var httpReg = /http/i;
						if (!httpReg.test(link)) {
							link = "http://" + link;
						}
						attributes.href = link;
						attributes.title = link;
						attributes.target = "_blank";
						attributes["data-cke-saved-href"] = linkText ? linkText : link;
						var selection = editor.getSelection();
						var element = selection.getStartElement();
						if (element.$.tagName === "A") {
							element.setAttributes(attributes);
						} else {
							var ranges = selection.getRanges(true);
							if (ranges.length === 1) {
								var linkHtmlTpl = "<a target=\"_blank\" href=\"{0}\" title=\"{1}\"><span>{2}</span></a>";
								var linkHtml = Ext.String.format(linkHtmlTpl, link, link, linkText);
								var linkNode = CKEDITOR.dom.element.createFromHtml(linkHtml);
								var range = ranges[0];
								if (!range.collapsed) {
									range.deleteContents();
								}
								range.insertNode(linkNode);
								range.selectNodeContents(linkNode);
								selection.selectRanges(ranges);
							}
						}
						editor.updateElement();
						editor.focus();
					}
				}
			},

			/**
			 * Устанавливает значение HtmlEdit от ckeditor.
			 * @private
			 */
			onDocumentMouseDown: function(e) {
				var htmlEditWrapEl = this.getWrapEl();
				if (e.within(htmlEditWrapEl.dom) && !e.within(this.toolbarEl.dom)) {
					return;
				}
				this.setValue(this.getEditorValue());
			},

			/**
			 * Обработчик события получения фокуса элементом управления.
			 * @protected
			 */
			onFocus: function() {
				if (!this.enabled || !this.rendered) {
					return;
				}
				this.focused = true;
				this.fireEvent("focus", this);
				this.fireEvent("focusChanged", this);
			},

			/**
			 * Обработчик события потери фокуса элементом управления.
			 * @protected
			 */
			onBlur: function() {
				if (!this.enabled || !this.rendered) {
					return;
				}
				this.focused = false;
				this.fireEvent("blur", this);
				this.fireEvent("focusChanged", this);
			},

			/**
			 * Обработчик события click на элементе управления.
			 * @protected
			 * @param {Object} event Объект события.
			 */
			onClick: function(event) {
				var eventData = event.data;
				var target = eventData.getTarget();
				var targetPath = new CKEDITOR.dom.elementPath(target, this.editor);
				var link = targetPath.contains("a");
				if (eventData.$.ctrlKey && link && link.hasAttribute("href")) {
					eventData.preventDefault();
					var href = link.getAttribute("href");
					window.open(href, "_blank");
				}
			},

			/**
			 * Обработчик события doubleclick на элементе управления.
			 * @protected
			 * @param {Object} event Объект события.
			 */
			onDoubleClick: function(event) {
				var eventData = event.data;
				var target = eventData.element;
				var targetPath = new CKEDITOR.dom.elementPath(target, this.editor);
				var link = targetPath.contains("a");
				if (link && link.hasAttribute("href")) {
					event.cancel();
				}
			},

			/**
			 * Инициализация CKEDITOR.
			 * @private
			 */
			initCKEDITOR: function() {
				var id = this.id + "-";
				var textArea = Ext.get(id + this.controlElementPrefix + "-textarea");
				var editor = this.editor = CKEDITOR.replace(textArea.dom, this.getEditorConfig());
				editor.setMode("wysiwyg");
				editor.on("selectionChange", function(event) {
					var elementPath = event.data.path;
					var elements = elementPath.elements;
					var selectionStyles = this.getControlsStateByTextStyle(elements);
					this.updateControlsStateByTextStyle(selectionStyles);
				}, this);
				var document = Ext.getDoc();
				editor.on("focus", function() {
					document.on("mousedown", this.onDocumentMouseDown, this);
					this.onFocus();
				}, this);
				editor.on("blur", function() {
					document.un("mousedown", this.onDocumentMouseDown, this);
					this.onBlur();
				}, this);
				editor.on("destroy", function() {
					document.un("mousedown", this.onDocumentMouseDown, this);
				}, this);
				editor.on("instanceReady", this.onInstanceReady, this);
				editor.on("contentDom", this.onContentDom, this);
				editor.on("doubleclick", this.onDoubleClick, this);
				if (this.plainTextMode) {
					this.changeEditorMode(true);
					if (this.value) {
						this.setValue(this.value);
					}
				}
			},

			/**
			 * Обновляет контролы согласно конфигурации.
			 * @private
			 * @param {Object} controlState Конфигурация контролов.
			 */
			updateControlsStateByTextStyle: function(controlState) {
				var controls = this.toolbar;
				Terrasoft.each(controls, function(item) {
					var controlClassName = item.className;
					var controlTag = item.tag;
					if (controlClassName === "Terrasoft.Button") {
						if (controlTag !== "htmlMode" && controlTag !== "htmlMode") {
							item.setPressed(controlState[controlTag]);
						}
					} else if (controlClassName === "Terrasoft.ComboBoxEdit") {
						var firstLetter = new RegExp("\[a-z][A-Z]+", "ig");
						var replaceSymbol = new RegExp("\'", "ig");
						var controlStateValue = controlState[controlTag];
						var displayValue = controlStateValue.replace(replaceSymbol, "");
						displayValue = displayValue.replace(firstLetter, function(match) {
							return (match[0].toUpperCase() + match.slice(1));
						});
						var itemValue = item.getValue();
						var newItemValue = {
							value: controlStateValue,
							displayValue: displayValue
						};
						if (itemValue !== newItemValue) {
							item.setValue(newItemValue);
						}
					} else if (controlClassName === "Terrasoft.ColorButton") {
						if (controlTag === "fontColor" || controlTag === "hightlightColor") {
							item.setValue(controlState[controlTag]);
						}
					}
				});
			},

			/**
			 * Возвращает конфигурацию контролов согласно стилю элементов выделенного фрагмента текста.
			 * @private
			 * @param {Object} elements Элементы выделенного фрагмента текста.
			 * @return {Object} controlState Конфигурация контролов.
			 */
			getControlsStateByTextStyle: function(elements) {
				var controlState = {
					fontFamily: "",
					fontSize: "",
					fontStyleBold: false,
					fontStyleItalic: false,
					fontStyleUnderline: false,
					numberedList: false,
					bulletedList: false,
					justifyLeft: true,
					justifyCenter: false,
					justifyRight: false
				};
				for (var i = 0, elementsLength = elements.length; i < elementsLength; i++) {
					var elementName = elements[i].getName();
					var elementStyle = elements[i].$.style;
					if (elementStyle) {
						if (!controlState.fontFamily) {
							controlState.fontFamily = elementStyle.fontFamily;
						}
						if (!controlState.fontSize) {
							controlState.fontSize = elementStyle.fontSize.replace("px", "");
						}
						if (!controlState.fontColor) {
							controlState.fontColor = elementStyle.color;
						}
						if (!controlState.hightlightColor) {
							controlState.hightlightColor = elementStyle.background;
						}
						if (elementStyle.textAlign !== "") {
							if (!controlState.justifyCenter && !controlState.justifyRight) {
								controlState.justifyLeft = (elementStyle.textAlign === "left") ||
									(elementStyle.textAlign === "");
								controlState.justifyCenter = elementStyle.textAlign === "center";
								controlState.justifyRight = elementStyle.textAlign === "right";
							}
						}
					}
					if (!controlState.bulletedList) {
						controlState.bulletedList = elementName === "ul";
					}
					if (!controlState.numberedList) {
						controlState.numberedList = elementName === "ol";
					}
					if (!controlState.fontStyleBold) {
						controlState.fontStyleBold = elementName === "strong";
					}
					if (!controlState.fontStyleItalic) {
						controlState.fontStyleItalic = elementName === "em";
					}
					if (!controlState.fontStyleUnderline) {
						controlState.fontStyleUnderline = elementName === "u";
					}
				}
				if (!controlState.fontFamily) {
					controlState.fontFamily = "Segoe UI";
				}
				if (!controlState.fontSize) {
					controlState.fontSize = "14";
				}
				return controlState;
			},

			/**
			 * @inheritDoc Terrasoft.Bindable#subscribeForCollectionEvents
			 * @protected
			 */
			subscribeForCollectionEvents: function(binding, property, model) {
				this.callParent(arguments);
				var collection = model.get(binding.modelItem);
				collection.on("dataLoaded", this.onImagesLoaded, this);
				collection.on("add", this.onAddImage, this);
			},

			/**
			 * Расширяет механизм привязки событий миксина {@link Terrasoft.Bindable} работой с колонкой типа справочник.
			 * @protected
			 * @overridden
			 */
			subscribeForEvents: function(binding, property, model) {
				this.callParent(arguments);
				if (property !== "value") {
					return;
				}
				var validationMethodName = binding.config.validationMethod;
				if (validationMethodName) {
					var validationMethod = this[validationMethodName];
					model.validationInfo.on("change:" + binding.modelItem,
						function(collection, value) {
							validationMethod.call(this, value);
						},
						this
					);
				}
			},

			/**
			 * Обработчик события contentDom в ckeditor.
			 * Добавляет подписку на события contextmenu и click.
			 * @private
			 */
			onContentDom: function() {
				var editable = this.editor.editable();
				editable.on("contextmenu", function(event) {
					event.stop();
				}, this);
				editable.on("click", this.onClick, this);
			},

			/**
			 * Обработчик события instanceReady в ckeditor.
			 * @private
			 */
			onInstanceReady: function() {
				if (this.value) {
					this.setValue(this.value);
				}
				this.updateToolbar();
				this.applyFontStyle();
			},

			/**
			 * Обработчик события "dataLoaded" коллекции Terrasoft.Collection.
			 * @protected
			 * @param {Terrasoft.Collection} collection Коллекция картинок.
			 */
			onImagesLoaded: function(collection) {
				this.images = collection;
				if (this.images === null) {
					return;
				}
				this.images.eachKey(function(key, item, index) {
					this.onAddImage(item, index, key, true);
				}, this);
			},

			/**
			 * Обработчик события "add" коллекции Terrasoft.Collection
			 * @protected
			 * @param {Terrasoft.BaseViewModel} item Картинка.
			 */
			onAddImage: function(item) {
				if (this.editor && this.editor.document) {
					this.fixCursorInitPosition();
					var imageElement = this.editor.document.createElement("img");
					imageElement.setAttribute("alt", item.get("fileName"));
					imageElement.setAttribute("src", item.get("url"));
					this.editor.insertElement(imageElement);
				}
			},

			/**
			 * Инициализирует элементы управления
			 * @private
			 */
			initControls: function() {
				var toolbar = {};
				var memo = null;
				var items = this.items;
				if (items) {
					items.each(function(item) {
						if (item.tag === "plainText") {
							memo = item;
						} else {
							toolbar[item.tag] = item;
						}
					});
				}
				this.initToolbarItems(toolbar);
				this.initMemo(memo);
				this.initFonts();
			},

			/**
			 * Инициализирует тулбар.
			 * @virtual
			 * @protected
			 * @param {Object} toolbar Объект тулбара.
			 */
			initToolbarItems: function(toolbar) {
				var image = toolbar["image"];
				image.un("filesSelected", this.onFilesSelected);
				image.on("filesSelected", this.onFilesSelected, this);
				this.toolbar = toolbar;
			},

			/**
			 * Инициализирует мемо.
			 * @virtual
			 * @protected
			 * @param {Object} memo Объект мемо.
			 */
			initMemo: function(memo) {
				memo.on("blur", this.onMemoBlur, this);
				this.memo = memo;
			},

			/**
			 * Обработчик события blur элемента memo.
			 * @private
			 */
			onMemoBlur: function() {
				this.setValue(this.memo.getValue());
			},

			/**
			 * Подписка на загрузку изображения.
			 * @param {Array} files Массив файлов.
			 */
			onFilesSelected: function(files) {
				var imageFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
				var invalidFilesType = false;
				for (var i = 0; i < files.length; i++) {
					if (!imageFilter.test(files[i].type)) {
						invalidFilesType = true;
					}
				}
				if (!invalidFilesType) {
					this.fireEvent("imageLoaded", files);
				} else {
					Terrasoft.showInformation(resources.localizableStrings.InvalidFileTypeMessage);
				}
			},

			/**
			 * Смена режима элемента управления.
			 * @private
			 * @param {Boolean} plainTextMode Режим обычного текста.
			 */
			changeEditorMode: function(plainTextMode) {
				if (this.plainTextMode === plainTextMode) {
					return;
				}
				this.plainTextMode = !!plainTextMode;
				this.updateToolbar();
				var memo = this.memo;
				var value;
				if (plainTextMode) {
					value = this.getEditorValue();
				} else {
					value = memo ? memo.getValue() : "";
					if (value) {
						value = "<p>" + value.replace(/\n*$/, "").replace(/\n/g, "</p><p>") + "</p>";
					}
				}
				this.setValue(value);
				this.fireEvent("changePlainTextMode", this.value, this);
			},

			/**
			 * Обновление доступности елементов управления.
			 * @private
			 */
			updateToolbar: function() {
				var id = this.id;
				var toolbar = this.toolbar;
				var memo = this.memo;
				if (!toolbar || !memo) {
					return;
				}
				var plainTextMode = this.plainTextMode;
				var enabled = this.enabled;
				var hideModeButtons = this.hideModeButtons;
				toolbar["fontFamily"].setEnabled(!plainTextMode && enabled);
				toolbar["fontSize"].setEnabled(!plainTextMode && enabled);
				toolbar["fontStyleBold"].setEnabled(!plainTextMode && enabled);
				toolbar["fontStyleItalic"].setEnabled(!plainTextMode && enabled);
				toolbar["fontStyleUnderline"].setEnabled(!plainTextMode && enabled);
				toolbar["fontColor"].setEnabled(!plainTextMode && enabled);
				toolbar["hightlightColor"].setEnabled(!plainTextMode && enabled);
				toolbar["numberedList"].setEnabled(!plainTextMode && enabled);
				toolbar["bulletedList"].setEnabled(!plainTextMode && enabled);
				toolbar["justifyLeft"].setEnabled(!plainTextMode && enabled);
				toolbar["justifyCenter"].setEnabled(!plainTextMode && enabled);
				toolbar["justifyRight"].setEnabled(!plainTextMode && enabled);
				toolbar["image"].setEnabled(!plainTextMode && enabled);
				toolbar["link"].setEnabled(!plainTextMode && enabled);
				toolbar["htmlMode"].setEnabled(plainTextMode && enabled);
				toolbar["plainMode"].setEnabled(!plainTextMode && enabled);
				toolbar["htmlMode"].setPressed(!plainTextMode && enabled);
				toolbar["plainMode"].setPressed(plainTextMode && enabled);
				toolbar["htmlMode"].setVisible(!hideModeButtons);
				toolbar["plainMode"].setVisible(!hideModeButtons);
				memo.setReadonly(!enabled);
				var extToolbar = Ext.get(id + "-" + this.controlElementPrefix + "-toolbar");
				if (extToolbar) {
					extToolbar.dom.style.display = !enabled ? "none" : "table-cell";
				}
				var extHtmlEdit = Ext.get(id + "-" + this.controlElementPrefix + "-htmltext");
				if (extHtmlEdit) {
					extHtmlEdit.dom.style.display = plainTextMode ? "none" : "table-cell";
				}
				var extPlainText = Ext.get(id + "-" + this.controlElementPrefix + "-plaintext");
				if (extPlainText) {
					extPlainText.dom.style.display = !plainTextMode ? "none" : "table-cell";
				}
				var editor = this.editor;
				if (editor) {
					// TODO: 200083
					try {
						editor.setReadOnly(!enabled);
					} catch (e) {
						if (editor.document) {
							editor.document.getBody().$.contentEditable = enabled;
						}
					}
					if (extHtmlEdit) {
						extHtmlEdit.dom.style.backgroundColor = enabled ? "#ffffff" : "#f9f9f9";
					}
				}
			},

			/**
			 * Изменение свойства активности элемента управления.
			 * @protected
			 * @overridden
			 * @param {Boolean} enabled Активен.
			 */
			setEnabled: function(enabled) {
				if (enabled !== this.enabled) {
					this.enabled = enabled;
					this.fireEvent("changeEnabled", enabled, this);
					var editor = this.editor;
					if (editor && editor.loaded) {
						this.updateToolbar();
					}
				}
			},

			/**
			 * Удаляет html теги из строки.
			 * @private
			 * @param {String} value Строка с html тегами.
			 * @return {String} Строка без html тегов.
			 */
			removeHtmlTags: function(value) {
				value = value.replace(/\t/gi, "");
				value = value.replace(/>\s+</gi, "><");
				if (Ext.isWebKit) {
					value = value.replace(/<div>(<div>)+/gi, "<div>");
					value = value.replace(/<\/div>(<\/div>)+/gi, "<\/div>");
				}
				value = value.replace(/<div>\n <\/div>/gi, "\n");
				value = value.replace(/<p>\n/gi, "");
				value = value.replace(/<div>\n/gi, "");
				value = value.replace(/<div><br[\s\/]*>/gi, "");
				value = value.replace(/<br[\s\/]*>\n?|<\/p>|<\/div>/gi, "\n");
				value = value.replace(/<[^>]+>|<\/\w+>/gi, "");
				value = value.replace(/ /gi, " ");
				value = value.replace(/&/gi, "&");
				value = value.replace(/•/gi, " * ");
				value = value.replace(/–/gi, "-");
				value = value.replace(/"/gi, "\"");
				value = value.replace(/«/gi, "\"");
				value = value.replace(/»/gi, "\"");
				value = value.replace(/‹/gi, "<");
				value = value.replace(/›/gi, ">");
				value = value.replace(/™/gi, "(tm)");
				value = value.replace(/</gi, "<");
				value = value.replace(/>/gi, ">");
				value = value.replace(/©/gi, "(c)");
				value = value.replace(/®/gi, "(r)");
				value = value.replace(/\n*$/, "");
				value = value.replace(/(\n)( )+/, "\n");
				value = value.replace(/(\n)+$/, "");
				return value;
			},

			/**
			 * Инициализирует шрифты.
			 * @private
			 */
			initFonts: function() {
				var fontFamilies = this.fontFamily;
				var fontFamiliesArr = fontFamilies.split(",");
				var fontFamiliesColl = Ext.create("Terrasoft.Collection");
				for (var i = 0; i < fontFamiliesArr.length; i++) {
					fontFamiliesColl.add(i, {value: fontFamiliesArr[i], displayValue: fontFamiliesArr[i]});
				}
				fontFamiliesColl.sortByFn(function(elA, elB) {
					var valueA = elA.value;
					var valueB = elB.value;
					if (valueA === valueB) {
						return 0;
					}
					return (valueA < valueB) ? -1 : 1;
				});
				var toolbar = this.toolbar;
				toolbar["fontFamily"].on("prepareList", function() {
					toolbar["fontFamily"].loadList(fontFamiliesColl);
				});
				toolbar["fontFamily"].on("change", function() {
					var fontFamilyValue = toolbar["fontFamily"].getValue();
					if (fontFamilyValue && this.enabled) {
						this.defaultFontFamily = fontFamilyValue.value;
						this.applyFontStyleFamily();
					}
				}, this);
				var fontSizes = this.fontSize;
				var fontSizesArr = fontSizes.split(",");
				var fontSizesColl = Ext.create("Terrasoft.Collection");
				for (var i = 0; i < fontSizesArr.length; i++) {
					fontSizesColl.add(i, {value: fontSizesArr[i] + "px", displayValue: fontSizesArr[i]});
				}
				toolbar["fontSize"].on("prepareList", function() {
					toolbar["fontSize"].loadList(fontSizesColl);
				});
				toolbar["fontSize"].on("change", function() {
					var fontSizeValue = toolbar["fontSize"].getValue();
					if (fontSizeValue && this.enabled) {
						this.defaultFontSize = fontSizeValue.value.replace("px", "");
						this.applyFontStyleSize();
					}
				}, this);
			},

			/**
			 * Обновляет стили шрифта.
			 * @private
			 */
			applyFontStyle: function() {
				this.applyFontStyleFamily();
				this.applyFontStyleSize();
				this.applyFontStyleColor();
				this.applyFontStyleBackgroundColor();
			},

			/**
			 * Обновляет семейство шрифта.
			 * @private
			 */
			applyFontStyleFamily: function() {
				var StyleConstructor = CKEDITOR.style;
				this.setStyle(new StyleConstructor({
					element: "span",
					styles: {
						"font-family": "#(family)"
					},
					overrides: [
						{
							element: "font",
							attributes: {
								face: null
							}
						}
					]
				}, {family: this.defaultFontFamily}));
			},

			/**
			 * Обновляет размер шрифта.
			 * @private
			 */
			applyFontStyleSize: function() {
				var StyleConstructor = CKEDITOR.style;
				this.setStyle(new StyleConstructor({
					element: "span",
					styles: {
						"font-size": "#(size)"
					},
					overrides: [
						{
							element: "font",
							attributes: {
								size: null
							}
						}
					]
				}, {size: this.defaultFontSize + "px"}));
			},

			/**
			 * Обновляет цвет шрифта.
			 * @private
			 */
			applyFontStyleColor: function() {
				var StyleConstructor = CKEDITOR.style;
				this.setStyle(new StyleConstructor({
					element: "span",
					styles: {
						color: "#(color)"
					},
					overrides: [
						{
							element: "font",
							attributes: {
								color: null
							}
						}
					]
				}, {color: this.defaultFontColor}));
			},

			/**
			 * Обновляет цвет подложки шрифта.
			 * @private
			 */
			applyFontStyleBackgroundColor: function() {
				var StyleConstructor = CKEDITOR.style;
				this.setStyle(new StyleConstructor({
					element: "span",
					styles: {"background-color": "#(color)"},
					overrides: [
						{
							element: "font",
							attributes: {"background": null}
						}
					]
				}, {color: this.defaultHighlight}));
			},

			/**
			 * Устанавливает стиль редактора.
			 * @private
			 * @param {Object} style Строка с html тегами.
			 */
			setStyle: function(style) {
				var editor = this.editor;
				if (!editor.document) {
					return;
				}
				//TODO узнать зачем здесь фокус и кто его сюда поставил.
				// С данным комментарием себя правильно ведут детали "файлы и ссылки" и не происходит подсветка кнопок
				// сохранения на задачах типа Email при простом переходе на задачу в вертикальном реестре расписания
				//editor.focus();
				editor.fire("saveSnapshot");
				editor.applyStyle(style);
				style.apply(editor.document);
				editor.fire("saveSnapshot");
			},

			/**
			 * Возвращает комбинации клавиш для CKEDITOR.
			 * @protected
			 * @return {Array} Комбинации клавиш для CKEDITOR.
			 */
			getKeyStrokes: function() {
				return [
					[0x110000 + 66, "bold"], // CTRL + B
					[0x110000 + 73, "italic"], // CTRL + I
					[0x110000 + 85, "underline"], // CTRL + U
					[0x110000 + 90, "undo"], // CTRL + Z
					[0x110000 + 89, "redo"], // CTRL + Y
					[0x110000 + 0x220000 + 90, "redo"] // CTRL + SHIFT + Z
				];
			},

			/**
			 * Возвращает настройки CKEDITOR по умолчанию.
			 * @private
			 * @return {Object} Настройки CKEDITOR по умолчанию.
			 */
			getEditorConfig: function() {
				return {
					blockedKeystrokes: [
						0x110000 + 66, // CTRL + B
						0x110000 + 73, // CTRL + I
						0x110000 + 85 // CTRL + U
					],
					keystrokes: this.getKeyStrokes(),
					linkShowAdvancedTab: true,
					linkShowTargetTab: true,
					width: "100%",
					height: "100%",
					resize_enabled: false,
					removePlugins: "toolbar,magicline,elementspath,link,unlink,liststyle,scayt",
					allowedContent: true,
					pasteFromWordRemoveFontStyles: false,
					pasteFromWordRemoveStyles: false,
					enterMode: 3,
					forceEnterMode: true,
					autoUpdateElement: true
				};
			}
		});

		return Terrasoft.HtmlEdit;

	}
);
