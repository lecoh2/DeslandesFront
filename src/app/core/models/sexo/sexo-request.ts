export interface SexoRequest {
  nomeSexo?: string; // Pode ser string | undefined, dependendo do uso

  // As validações que você usa no C# (MinLength, MaxLength, Required)
  // devem ser implementadas no Angular via FormBuilder ou Validators.
}
