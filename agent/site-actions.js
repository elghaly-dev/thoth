// Registers this page's operations with the agent runtime.
// agent-manifest.json loads this module through "actions.module". Only the names in
// "actions.agentTools" become model tools, called website_<name>.
// The page has one operation: reading Thoth's public facts. Nothing on it can be
// changed, ordered or sent, so there are no write or irreversible actions.
import { App } from "./thoth-page.js";

/**
 * Describes the page's operations as actions the agents can call.
 */
class SiteActions {
  /**
   * Register every site action with the runtime.
   *
   * :param actions: The runtime registry facade with a register(definition) method.
   */
  static registerActions(actions) {
    actions.register(SiteActions.readGuideAction());
  }

  /**
   * Describe the read action that returns Thoth's public facts.
   *
   * :return: The action definition.
   */
  static readGuideAction() {
    return {
      name: "get_thoth_guide",
      description: "Read Thoth's published facts: what it is, the tools it offers with what each does, the languages it speaks, its integrity charter, what it cannot do, its privacy note, and the links to the full app.",
      effect: "read",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: SiteActions.readGuide,
    };
  }

  /**
   * Return a fresh copy of the facts.
   *
   * :return: Thoth's public facts as plain JSON data.
   */
  static readGuide() {
    return App.page.getGuide();
  }
}

// The runtime calls the module's registerActions export.
export const registerActions = SiteActions.registerActions;
