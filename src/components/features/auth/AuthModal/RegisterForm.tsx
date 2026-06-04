import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { registerSchema } from '@/types/auth.types';
import type { RegisterFormValues } from '@/types/auth.types';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GoogleButton from './GoogleButton';

interface RegisterFormProps {
  isLoading: boolean;
  onSubmit: (data: RegisterFormValues) => void;
  onGoogleSignIn: () => void;
  onToggleMode: () => void;
}

export const RegisterForm = ({
  isLoading,
  onSubmit,
  onGoogleSignIn,
  onToggleMode,
}: RegisterFormProps) => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
      />
      <Input
        label="Email"
        type="email"
        placeholder="name@example.com"
        {...form.register('email')}
        error={form.formState.errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        {...form.register('password')}
        error={form.formState.errors.password?.message}
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        {...form.register('confirmPassword')}
        error={form.formState.errors.confirmPassword?.message}
      />
      <Button
        type="submit"
        className="w-full h-12"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <GoogleButton onClick={onGoogleSignIn} disabled={isLoading} />

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-muted-foreground hover:text-brand-primary transition-standard"
        >
          Already have an account? <span className="font-semibold text-brand-primary">Sign in</span>
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
