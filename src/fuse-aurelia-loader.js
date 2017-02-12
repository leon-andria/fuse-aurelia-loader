/*eslint dot-notation:0*/
import {Origin} from 'aurelia-metadata';
import {TemplateRegistryEntry, Loader} from 'aurelia-loader';
import {TextTemplateLoader} from './text-template-loader';
import {PLATFORM} from 'aurelia-pal';

function ensureOriginOnExports(executed, name) {
  let target = executed;
  let key;
  let exportedValue;

  if (target.__useDefault) {
    target = target['default'];
  }

  Origin.set(target, new Origin(name, 'default'));

  for (key in target) {
    exportedValue = target[key];

    if (typeof exportedValue === 'function') {
      Origin.set(exportedValue, new Origin(name, key));
    }
  }

  return executed;
}

/**
* A default implementation of the Loader abstraction which works with SystemJS, RequireJS and Dojo Loader.
*/
export class FuseAureliaLoader extends Loader {
  /**
  * The name of the underlying native loader plugin used to load text.
  */
  textPluginName = 'text';

  loaderPlugins = Object.create(null);

  /**
  * Creates an instance of the DefaultLoader.
  */
  constructor() {
    super();

    this.moduleRegistry = Object.create(null);
    this.useTemplateLoader(new TextTemplateLoader());

    let that = this;

    this.addPlugin('template-registry-entry', {
      'fetch': function(address) {
        console.log('fetch =>', address)
        let entry = that.getOrCreateTemplateRegistryEntry(address);
        return entry.templateIsLoaded ? entry : that.templateLoader.loadTemplate(that, entry).then(x => entry);
      }
    });
    // this.addPlugin('html-resource-plugin', {
    //   'fetch': function(address) {
    //     console.log('fetch =>', address)
    //     let entry = that.getOrCreateTemplateRegistryEntry(address);
    //     return entry.templateIsLoaded ? entry : that.templateLoader.loadTemplate(that, entry).then(x => entry);
    //   }
    // });
    // this.addPlugin('css-resource-plugin', {
    //   'fetch': function(address) {
    //     console.log('fetch =>', address)
    //     let entry = that.getOrCreateTemplateRegistryEntry(address);
    //     return entry.templateIsLoaded ? entry : that.templateLoader.loadTemplate(that, entry).then(x => entry);
    //   }
    // });
  }

  /**
  * Instructs the loader to use a specific TemplateLoader instance for loading templates
  * @param templateLoader The instance of TemplateLoader to use for loading templates.
  */
  useTemplateLoader(templateLoader) {
    this.templateLoader = templateLoader;
  }

  /**
  * Loads a collection of modules.
  * @param ids The set of module ids to load.
  * @return A Promise for an array of loaded modules.
  */
  loadAllModules(ids): Promise {
    //In theory, this is called for resource dependencies
    console.log("loadAllModules =>", ids)
    let loads = [];

    for (let i = 0, ii = ids.length; i < ii; ++i) {
      let item = ids[i];
      // if(item.endsWith(".html")) {
      //   loads.push(this._import(item));
      // }else{
        loads.push(this.loadModule(item));
      // }
      
    }

    return Promise.all(loads);
  }

  /**
  * Loads a template.
  * @param url The url of the template to load.
  * @return A Promise for a TemplateRegistryEntry containing the template.
  */
  loadTemplate(url): Promise {
    console.log("loadTemplate =>", url)
    return this._import(this.applyPluginToUrl(url, 'template-registry-entry'));
  }

  /**
  * Loads a text-based resource.
  * @param url The url of the text file to load.
  * @return A Promise for text content.
  */
  loadText(url): Promise {
    console.log("loadText =>", url)
    return Promise.resolve(FuseBox.import("~/" + url))
    // return this._import(this.applyPluginToUrl(url, this.textPluginName)).then(textOrModule => {
    //   if (typeof textOrModule === 'string') {
    //     return textOrModule;
    //   }

    //   return textOrModule['default'];
    // });
  }

  /**
  * Loads a module.
  * @param id The module id to normalize.
  * @return A Promise for the loaded module.
  */
  loadModule(id) {
    console.log("loadModule =>", id)
    let module = null
    if(id === 'main' || id === 'app') { // This is not correct, just for overview only
      module = FuseBox.import('~/' + id)
    }else if(id.startsWith("aurelia-templating-resources/")) { //This should be handled in a Plugin
      id = id.replace("aurelia-templating-resources", "aurelia-templating-resources/dist/commonjs")
      module = FuseBox.import(id)
    }else if(id.startsWith("aurelia-templating-router/")) { //This should be handled in a Plugin
      id = id.replace("aurelia-templating-router", "aurelia-templating-router/dist/commonjs")
      module = FuseBox.import(id)
    }
    // else{
    //   // module = this._import(id, false);  
    //   // if(module === null) {
    //      module = FuseBox.import(id)
    //   // }
    // }
    else if(id.startsWith("html-resource-plugin!")){
      module = this._import(id)
      // id = id.replace("html-resource-plugin!", "")
      console.log(module, id)
    }
    else{
      module = FuseBox.import(id)
    }
    
    module = ensureOriginOnExports(module, id);
    

    return Promise.resolve(module);
  }

  /**
  * Registers a plugin with the loader.
  * @param pluginName The name of the plugin.
  * @param implementation The plugin implementation.
  */
  addPlugin(pluginName, implementation) {
    console.log("addPlugin =>", pluginName, implementation)
    // if(!this.loaderPlugins[pluginName]) {
      this.loaderPlugins[pluginName] = implementation;
    // }
  }

  /**
  * Normalizes a module id.
  * @param moduleId The module id to normalize.
  * @param relativeTo What the module id should be normalized relative to.
  * @return A promise for the normalized module id.
  */
  normalize(moduleId, relativeTo) {
    console.log("normalize =>", moduleId, relativeTo)
    return Promise.resolve(moduleId);
  }

  /**
  * Maps a module id to a source.
  * @param id The module id.
  * @param source The source to map the module to.
  */
  map(id, source) {
    console.log("map =>", id, source)
  }

   _import(address) {
    const addressParts = address.split('!');
    const moduleId = addressParts.splice(addressParts.length - 1, 1)[0];
    const loaderPlugin = addressParts.length === 1 ? addressParts[0] : null;

    if (loaderPlugin) {
      const plugin = this.loaderPlugins[loaderPlugin];
      if (!plugin) {
        throw new Error(`Plugin ${loaderPlugin} is not registered in the loader.`);
      }
      return Promise.resolve(plugin.fetch(moduleId));
    }
    //throw new Error(`Unable to find module with ID: ${moduleId}`);
    return null
  }

  /**
  * Alters a module id so that it includes a plugin loader.
  * @param url The url of the module to load.
  * @param pluginName The plugin to apply to the module id.
  * @return The plugin-based module id.
  */
  applyPluginToUrl(url, pluginName) {
    console.log("applyPluginToUrl =>", url, pluginName)
    // if(pluginName === "html-resource-plugin") {
    //   pluginName = "template-registry-entry"
    // }

    return `${pluginName}!${url}`;
  }
}

PLATFORM.Loader = FuseAureliaLoader;
