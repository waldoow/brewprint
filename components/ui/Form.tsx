import React, { createContext, useContext } from 'react';
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

type FormItemContextValue = {
  id: string;
};

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);
const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

const Form = FormProvider;

type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
} & Omit<ControllerProps<TFieldValues, TName>, 'name'>;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemProps = {
  children: React.ReactNode;
  style?: any;
};

const FormItem = React.forwardRef<View, FormItemProps>(
  ({ children, style, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <FormItemContext.Provider value={{ id }}>
        <ThemedView ref={ref} style={[styles.formItem, style]} {...props}>
          {children}
        </ThemedView>
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

type FormLabelProps = {
  children: React.ReactNode;
  style?: any;
};

const FormLabel = React.forwardRef<any, FormLabelProps>(
  ({ children, style, ...props }, ref) => {
    const { error, formItemId } = useFormField();
    const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');
    const errorColor = useThemeColor({ light: '#ef4444', dark: '#ef4444' }, 'error');
    
    return (
      <ThemedText
        ref={ref}
        style={[
          styles.formLabel,
          { color: error ? errorColor : textColor },
          style
        ]}
        nativeID={formItemId}
        {...props}
      >
        {children}
      </ThemedText>
    );
  }
);
FormLabel.displayName = 'FormLabel';

type FormControlProps = {
  children: React.ReactNode;
};

const FormControl = React.forwardRef<View, FormControlProps>(
  ({ children, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    
    return (
      <View ref={ref} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              nativeID: formItemId,
              'aria-describedby': !error
                ? `${formDescriptionId}`
                : `${formDescriptionId} ${formMessageId}`,
              'aria-invalid': !!error,
              ...child.props,
            });
          }
          return child;
        })}
      </View>
    );
  }
);
FormControl.displayName = 'FormControl';

type FormDescriptionProps = {
  children: React.ReactNode;
  style?: any;
};

const FormDescription = React.forwardRef<any, FormDescriptionProps>(
  ({ children, style, ...props }, ref) => {
    const { formDescriptionId } = useFormField();
    const textSecondary = useThemeColor({ light: '#6b7280', dark: '#a0a0a0' }, 'textSecondary');
    
    return (
      <ThemedText
        ref={ref}
        nativeID={formDescriptionId}
        style={[
          styles.formDescription,
          { color: textSecondary },
          style
        ]}
        {...props}
      >
        {children}
      </ThemedText>
    );
  }
);
FormDescription.displayName = 'FormDescription';

type FormMessageProps = {
  children?: React.ReactNode;
  style?: any;
};

const FormMessage = React.forwardRef<any, FormMessageProps>(
  ({ children, style, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const errorColor = useThemeColor({ light: '#ef4444', dark: '#ef4444' }, 'error');
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <ThemedText
        ref={ref}
        nativeID={formMessageId}
        style={[
          styles.formMessage,
          { color: errorColor },
          style
        ]}
        {...props}
      >
        {body}
      </ThemedText>
    );
  }
);
FormMessage.displayName = 'FormMessage';

const styles = StyleSheet.create({
  formItem: {
    marginVertical: 4, // Reduced from 8 to 4
    backgroundColor: 'transparent',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8, // Increased from 6 to 8 for even better spacing
    lineHeight: 20,
  },
  formDescription: {
    fontSize: 12,
    marginTop: 2, // Reduced from 4 to 2
    lineHeight: 16,
  },
  formMessage: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2, // Reduced from 4 to 2
    lineHeight: 16,
  },
});

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};