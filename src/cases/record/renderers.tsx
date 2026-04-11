import Input from "../../design-system/components/controls/Input"
import ReadOnlyValue from "../../design-system/components/controls/ReadOnlyValue"
import Select from "../../design-system/components/controls/Select"
import Textarea from "../../design-system/components/controls/Textarea"
import Field from "../../design-system/components/fields/Field"
import FieldGroupStack from "../../design-system/components/field-groups/FieldGroupStack"
import FormFieldGrid from "../../design-system/components/field-groups/FormFieldGrid"
import RecordFieldGrid from "../../design-system/components/field-groups/RecordFieldGrid"
import FormSection from "../../design-system/components/sections/FormSection"
import RecordSection from "../../design-system/components/sections/RecordSection"
import type {
  CaseRecord,
  FieldConfig,
  SchemaMode,
  SectionConfig,
  UpdateCaseRecordField,
} from "./types"

type RenderCaseRecordSectionArgs = {
  section: SectionConfig
  record: CaseRecord
  renderMode: SchemaMode
  updateField: UpdateCaseRecordField
  getDisplayValue: (value: string) => string
  autoFocusFieldKey?: keyof CaseRecord
}

function renderSectionField(
  field: FieldConfig,
  record: CaseRecord,
  renderMode: SchemaMode,
  sectionTitle: string,
  updateField: UpdateCaseRecordField,
  getDisplayValue: (value: string) => string,
  autoFocusFieldKey?: keyof CaseRecord
) {
  const fieldValue = record[field.key]
  const fieldSpan = field.span ?? 1
  const wrapperClassName = fieldSpan === 2 ? "md:col-span-2" : undefined
  const displayBehavior = field.displayBehavior ?? (field.multiline ? "full-width" : "compact")
  const readOnlyVariant = field.readOnlyVariant ?? (field.multiline ? "boxed" : "compact")

  const handleFieldChange = (nextValue: string) => {
    if (field.onChange) {
      field.onChange(nextValue)
      return
    }

    updateField(field.key, nextValue as CaseRecord[typeof field.key])
  }

  const fieldLabel = field.multiline && field.label === sectionTitle
    ? undefined
    : field.label

  const displayField = (
    <Field
      label={fieldLabel}
      helper={field.helper}
      required={field.required}
      variant={field.multiline ? "default" : "tight"}
    >
      <ReadOnlyValue
        size="sm"
        value={getDisplayValue(fieldValue)}
        behavior={displayBehavior}
        variant={readOnlyVariant}
        multiline={field.multiline}
      />
    </Field>
  )

  if (renderMode === "view" || field.editable === false) {
    return (
      <div key={field.key} className={wrapperClassName}>
        {displayField}
      </div>
    )
  }

  if (field.type === "select") {
    return (
      <div key={field.key} className={wrapperClassName}>
        <Field
          label={fieldLabel}
          helper={field.helper}
          required={field.required}
          error={field.error}
        >
          <Select
            size="sm"
            name={field.key}
            value={fieldValue}
            onChange={(event) => handleFieldChange(event.target.value)}
            onBlur={field.onBlur}
          >
            {field.options?.map((option) => (
              <option key={option.value || option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    )
  }

  if (field.type === "textarea") {
    return (
      <div key={field.key} className={wrapperClassName}>
        <Field
          label={fieldLabel}
          helper={field.helper}
          required={field.required}
        >
          <Textarea
            size="sm"
            name={field.key}
            value={fieldValue}
            onChange={(event) => handleFieldChange(event.target.value)}
            onBlur={field.onBlur}
          />
        </Field>
      </div>
    )
  }

  return (
    <div key={field.key} className={wrapperClassName}>
      <Field
        label={fieldLabel}
        helper={field.helper}
        required={field.required}
        error={field.error}
      >
          <Input
            size="sm"
            name={field.key}
            type={field.inputType ?? "text"}
            value={fieldValue}
            autoFocus={field.key === autoFocusFieldKey}
            onChange={(event) => handleFieldChange(event.target.value)}
            onBlur={field.onBlur}
          />
      </Field>
    </div>
  )
}

export function renderCaseRecordSection({
  section,
  record,
  renderMode,
  updateField,
  getDisplayValue,
  autoFocusFieldKey,
}: RenderCaseRecordSectionArgs) {
  const sectionVisibleInMode =
    !section.visibleIn || section.visibleIn.includes(renderMode)

  if (!sectionVisibleInMode) {
    return null
  }

  const visibleFields = section.fields.filter((field) => {
    const visibleInMode =
      !field.visibleIn || field.visibleIn.includes(renderMode)
    const visibleForRecord =
      !field.when || field.when(record)

    return visibleInMode && visibleForRecord
  })

  if (visibleFields.length === 0) {
    return null
  }

  const fields = visibleFields.map((field) =>
    renderSectionField(
      field,
      record,
      renderMode,
      section.title,
      updateField,
      getDisplayValue,
      autoFocusFieldKey
    )
  )
  const isStack = section.layout === "stack"

  if (renderMode === "view") {
    return (
      <RecordSection
        key={section.id}
        title={section.title}
        description={section.description}
        className={section.className ?? "pt-[var(--space-4)]"}
      >
        {isStack ? (
          <FieldGroupStack>{fields}</FieldGroupStack>
        ) : (
          <RecordFieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
            {fields}
          </RecordFieldGrid>
        )}
      </RecordSection>
    )
  }

  return (
    <FormSection
      key={section.id}
      title={section.title}
      description={section.description}
      className={section.className}
    >
      {isStack ? (
        <FieldGroupStack>{fields}</FieldGroupStack>
      ) : (
        <FormFieldGrid>{fields}</FormFieldGrid>
      )}
    </FormSection>
  )
}
