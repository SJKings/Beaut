import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View, type TextInputProps } from 'react-native';
import { Page } from '../components/page';
import { Button, Footer, ScreenHeader, T } from '../components/ui';
import { useCatalog, useStore } from '../lib/store';
import { colors, fonts } from '../lib/theme';
import { openPrivacy } from '../components/privacy';

function Field({ label, hint, error, multiline, ...input }: TextInputProps & { label: string; hint?: string; error?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <T w={600} style={{ fontSize: 13, color: colors.body }}>
        {label}
        {hint && <T style={{ fontSize: 13, color: colors.muted3 }}> {hint}</T>}
      </T>
      <TextInput
        {...input}
        multiline={multiline}
        placeholderTextColor={colors.placeholder}
        style={{
          height: multiline ? 92 : 52,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingTop: multiline ? 14 : 0,
          paddingBottom: multiline ? 14 : 0,
          fontSize: 15,
          fontFamily: fonts[400],
          color: colors.ink,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {!!error && <T style={{ fontSize: 12, color: colors.danger }}>{error}</T>}
    </View>
  );
}

export default function Details() {
  const { form, setForm, draft } = useStore();
  const { emailEnabled } = useCatalog();
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  if (!draft) return <Redirect href="/home" />;

  const onContinue = () => {
    const e: typeof errors = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name so the studio knows who to expect';
    if (form.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number';
    setErrors(e);
    if (!Object.keys(e).length) router.push('/review');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Page top={8} bottom={24} gap={20}>
        <ScreenHeader title="Your details" />
        <View style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.pinkTint }}>
          <T style={{ fontSize: 14, lineHeight: 21, color: colors.pinkNote }}>
            No account needed. After booking you'll get a unique code to find, reschedule or cancel your appointment.
          </T>
        </View>
        <Field
          label="Full name"
          value={form.name}
          onChangeText={(name) => setForm({ name })}
          placeholder="e.g. Amanda Okafor"
          autoComplete="name"
          textContentType="name"
          error={errors.name}
        />
        <Field
          label="Phone number"
          value={form.phone}
          onChangeText={(phone) => setForm({ phone })}
          placeholder="+234 801 234 5678"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          error={errors.phone}
        />
        <Field
          label="Email"
          hint={emailEnabled ? "(optional, we'll send your code)" : '(optional)'}
          value={form.email}
          onChangeText={(email) => setForm({ email })}
          placeholder="you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Field label="Notes for your specialist" value={form.notes} onChangeText={(notes) => setForm({ notes })} placeholder="Allergies, preferred style…" multiline />
        <T style={{ fontSize: 12, lineHeight: 18, color: colors.muted3 }}>
          Your details are shared only with the studio to manage your appointment.{' '}
          <T w={600} style={{ fontSize: 12, color: colors.pink }} onPress={openPrivacy} accessibilityRole="link">
            Privacy policy
          </T>
        </T>
      </Page>
      <Footer>
        <Button label="Review booking" height={58} onPress={onContinue} />
      </Footer>
    </KeyboardAvoidingView>
  );
}
