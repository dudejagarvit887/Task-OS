# Tambo Components Guidelines

Components in this directory are registered with Tambo for AI-driven generative UI.

Read the full documentation at https://docs.tambo.co/llms.txt for component creation patterns and best practices.

## Tambo Generative UI

- Props are `undefined` during streaming—always use `?.` and `??`
- Use `useTamboComponentState` for state the assistant needs to see
- Use `useTamboStreamStatus` when you need to control UI behavior based on streaming state
- Common `useTamboStreamStatus` use cases: disabling buttons, showing section-level loading, waiting for required fields before rendering
- String props can render as they stream; structured data like arrays/objects may stream progressively or wait for completion depending on the use case
- Generate array item IDs client-side—React keys must be stable, and AI-generated IDs are unreliable during streaming
- If the item IDs are used to fetch data, use `useTamboStreamStatus` to wait until the array is complete before rendering
- Fetch server data or derive from app state; don't have AI generate what already exists
- Use `.describe()` to guide prop generation