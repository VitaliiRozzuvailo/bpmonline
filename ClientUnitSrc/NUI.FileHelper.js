define('FileHelper', ['ext-base', 'terrasoft', 'FileHelperResources', 'ConfigurationConstants', 'MaskHelper'],
	function(Ext, Terrasoft, resources, ConfigurationConstants, MaskHelper) {
		function getFileIconByFileName(fileName) {
			var arr = /^.*\.([A-z]{2,4})$/g.exec(fileName);
			if (!arr || arr.length < 2) {
				return Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.AllIcon);
			}
			var filetype = arr[1].toLocaleLowerCase();
			switch (filetype) {
				case 'doc':
				case 'docx':
					return Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DocIcon);
				case 'pdf':
					return Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.PdfIcon);
				case 'ppt':
					return Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.PptIcon);
			}
			return Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.AllIcon);
		}
		function getImageUrl(config) {
			return Terrasoft.ImageUrlBuilder.getUrl(config);
		}
		function sizeConverter(value) {
			return Math.round(value / 1024) + resources.localizableStrings.FileSizeMetrics;
		}
		var addFileButtonConfig = {
			className: 'Terrasoft.Button',
			style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
			caption: resources.localizableStrings.AddFileButtonCaption,
			classes: {
				textClass: ['file-add-button']
			},
			fileUpload: true,
			filesSelected: {
				bindTo: 'onFileSelect'
			}
		};
		function onFileSelect(files, schemaName, filterPath, filterValue, callback) {
			MaskHelper.ShowBodyMask();
			var newItemId = Terrasoft.generateGUID();
			var file = files[0];
			var parameters = {};
			parameters.Id = {
				value: newItemId,
				type: Terrasoft.DataValueType.GUID
			};
			parameters.CreatedOn = {
				value: Terrasoft.SysValue.CURRENT_DATE_TIME,
				type: Terrasoft.DataValueType.DATE_TIME
			};
			parameters.CreatedBy = {
				value: Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
				type: Terrasoft.DataValueType.GUID
			};
			parameters.Name = {
				value: file.name,
				type: Terrasoft.DataValueType.TEXT
			};
			parameters.Version = {
				value: 1,
				type: Terrasoft.DataValueType.INTEGER
			};
			parameters.Size = {
				value: file.size,
				type: Terrasoft.DataValueType.INTEGER
			};
			parameters.Type = {
				value: ConfigurationConstants.FileType.File,
				type: Terrasoft.DataValueType.GUID
			};
			parameters[filterPath] = {
				value: filterValue,
				type: Terrasoft.DataValueType.GUID
			};
			var data = {
				entityName: schemaName,
				fileFieldName: 'Data',
				file: file,
				parameters: parameters
			};
			Terrasoft.FileHelper.uploadFile(Terrasoft.QueryOperationType.INSERT, data, function() {
				MaskHelper.HideBodyMask();
				arguments[arguments.length] = filterValue;
				arguments.length++;
				callback.apply(this, arguments);
			}, this);
		}
		return {
			addFileButtonConfig: addFileButtonConfig,
			getFileIconByFileName: getFileIconByFileName,
			sizeConverter: sizeConverter,
			onFileSelect: onFileSelect
		};
	});