import {TemplateRegistryEntry, Loader} from 'aurelia-loader';
import {DOM} from 'aurelia-pal';

/**
* An implementation of the TemplateLoader interface implemented with text-based loading.
*/
export class TextTemplateLoader {
  /**
  * Loads a template.
  * @param loader The loader that is requesting the template load.
  * @param entry The TemplateRegistryEntry to load and populate with a template.
  * @return A promise which resolves when the TemplateRegistryEntry is loaded with a template.
  */
  loadTemplate(loader, entry): Promise {
    return loader.loadText(entry.address).then(text => {
      console.log(text)
      entry.template = DOM.createTemplateFromMarkup(text.default);
    });
  }
}