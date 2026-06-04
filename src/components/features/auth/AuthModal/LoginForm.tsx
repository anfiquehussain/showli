import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { loginSchema } from '@/types/auth.types';
import type { LoginFormValues } from '@/types/auth.types';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GoogleButton from './GoogleButton';

interface LoginFormProps {
  isLoading: boolean;
  onSubmit: (data: LoginFormValues) => void;
  onGoogleSignIn: () => void;
  onToggleMode: () => void;
}

export const LoginForm = ({
  isLoading,
  onSubmit,
  onGoogleSignIn,
  onToggleMode,
}: LoginFormProps) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
      <Button
        type="submit"
        className="w-full h-12"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
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
          Don't have an account? <span className="font-semibold text-brand-primary">Sign up</span>
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
