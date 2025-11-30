export interface DataTableField {
  field_name: string;
  type: number;
  ui_type?:
    | "Text"
    | "Barcode"
    | "Number"
    | "Progress"
    | "Currency"
    | "Rating"
    | "SingleSelect"
    | "MultiSelect"
    | "DateTime"
    | "Checkbox"
    | "User"
    | "GroupChat"
    | "Phone"
    | "Url"
    | "Attachment"
    | "SingleLink"
    | "Formula"
    | "DuplexLink"
    | "Location"
    | "CreatedTime"
    | "ModifiedTime"
    | "CreatedUser"
    | "ModifiedUser"
    | "AutoNumber"
    | undefined;
  property?:
    | {
        options?:
          | {
              name?: string | undefined;
              id?: string | undefined;
              color?: number | undefined;
            }[]
          | undefined;
        formatter?: string | undefined;
        date_formatter?: string | undefined;
        auto_fill?: boolean | undefined;
        multiple?: boolean | undefined;
        table_id?: string | undefined;
        table_name?: string | undefined;
        back_field_name?: string | undefined;
        auto_serial?:
          | {
              type: "custom" | "auto_increment_number";
              options?:
                | {
                    type: "system_number" | "fixed_text" | "created_time";
                    value: string;
                  }[]
                | undefined;
            }
          | undefined;
        location?:
          | {
              input_type: "only_mobile" | "not_limit";
            }
          | undefined;
        formula_expression?: string | undefined;
        allowed_edit_modes?:
          | {
              manual?: boolean | undefined;
              scan?: boolean | undefined;
            }
          | undefined;
        min?: number | undefined;
        max?: number | undefined;
        range_customize?: boolean | undefined;
        currency_code?: string | undefined;
        rating?:
          | {
              symbol?: string | undefined;
            }
          | undefined;
        type?:
          | {
              data_type: number;
              ui_property?:
                | {
                    currency_code?: string | undefined;
                    formatter?: string | undefined;
                    range_customize?: boolean | undefined;
                    min?: number | undefined;
                    max?: number | undefined;
                    date_formatter?: string | undefined;
                    rating?:
                      | {
                          symbol?: string | undefined;
                        }
                      | undefined;
                  }
                | undefined;
              ui_type?:
                | "Number"
                | "Progress"
                | "Currency"
                | "Rating"
                | "DateTime"
                | undefined;
            }
          | undefined;
        filter_info?:
          | {
              target_table?: string | undefined;
              filter_info?:
                | {
                    conjunction: "and" | "or";
                    conditions: Array<{
                      field_id: string;
                      operator:
                        | "is"
                        | "isNot"
                        | "contains"
                        | "doesNotContain"
                        | "isEmpty"
                        | "isNotEmpty"
                        | "isGreater"
                        | "isGreaterEqual"
                        | "isLess"
                        | "isLessEqual";
                      value?: string;
                    }>;
                  }
                | undefined;
            }
          | undefined;
      }
    | undefined;
  description?:
    | {
        disable_sync?: boolean | undefined;
        text?: string | undefined;
      }
    | undefined;
}

export type DataTableSort = Array<{
  field_name?: string;
  desc?: boolean;
}>;

export type RecordField = Record<
  string,
  | string
  | number
  | boolean
  | {
      text?: string;
      link?: string;
    }
  | {
      location?: string;
      pname?: string;
      cityname?: string;
      adname?: string;
      address?: string;
      name?: string;
      full_address?: string;
    }
  | Array<{
      id?: string;
      name?: string;
      avatar_url?: string;
    }>
  | Array<string>
  | Array<{
      id?: string;
      name?: string;
      en_name?: string;
      email?: string;
    }>
  | Array<{
      file_token?: string;
      name?: string;
      type?: string;
      size?: number;
      url?: string;
      tmp_url?: string;
    }>
>;
