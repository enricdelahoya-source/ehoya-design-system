Schema-driven UI (my system)

What I changed
Before I was building screens by hand.
Now I describe the screen as data and let the system render it.

Old way
I wrote UI directly:

<Field label="Status">
  <Select />
</Field>

I had to do this twice:

* once for view
* once for edit

Hard to maintain. Easy to drift.

---

New way
I describe the screen:

{
key: "status",
label: "Status",
type: "select"
}

Then a renderer builds the UI.

Same description → works for view and edit.

---

How it is structured

1. Controls
   These are the raw pieces:

* Input
* Select
* Textarea
* ReadOnlyValue

They just render something. No label, no structure.

---

2. Fields
   These wrap controls:

* Field → for edit
* DisplayField → for view

They add:

* label
* hint
* error
* spacing

So controls become real product fields.

---

3. Schema
   This is the important part.

Schema = description of fields

Example:

{
key: "status",
label: "Status",
type: "select"
}

This is NOT UI.
This is data that describes UI.

---

4. Renderer
   This is the glue.

It reads the schema and decides:

* if view → use DisplayField + ReadOnlyValue
* if edit → use Field + Input/Select

It turns data into UI.

---

5. Section helpers
   Each section builds its own schema.

Example:

getStatusSection(record, mode)

This is where:

* conditional fields live
* dynamic labels live
* business logic lives

Important:
Do NOT put this in the renderer.

---

Very important rule

Renderer = generic
Section = specific

Bad:
if (field.key === "status")

Good:
getStatusSection(...)

---

View vs Edit

Before:

* different layouts
* duplicated logic

Now:

* same schema
* same structure
* only rendering changes

---

Why this is better

1. No duplication
   One schema → both modes

2. Consistency
   All fields behave the same

3. Scales better
   Add/reorder fields without rewriting UI

4. Easier with AI
   UI is structured data
   AI can reason on it

---

Mental model

Old:
UI = code

New:
UI = schema + renderer

---

Simple way to remember

* Controls = raw UI
* Field = label + structure
* Schema = describes fields
* Renderer = builds UI
* Section helper = business logic

---

Important constraint

Do not overcomplicate schema early.
Keep it small.

Do not move everything to shared files too early.
Let the pattern prove itself first.

---

What I built

A system where:

* fields are data
* UI is generated
* view/edit are unified
* logic stays close to the section

This is closer to how real ERP systems work.
