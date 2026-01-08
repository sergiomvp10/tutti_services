import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register({
        email: registerEmail,
        password: registerPassword,
        name: registerName,
        phone: registerPhone,
        address: registerAddress,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex justify-center">
            <img src="/tutti_logo.png" alt="Tutti Services" className="h-24 object-contain" />
          </div>
          <CardDescription className="text-lg text-gray-600">
            Distribuidora de Frutas y Verduras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-green-100 p-1 rounded-lg">
              <TabsTrigger value="login" className="text-lg py-3 rounded-md data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">Ingresar</TabsTrigger>
              <TabsTrigger value="register" className="text-lg py-3 rounded-md data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-lg font-medium mb-2">Correo Electronico</label>
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="text-lg py-6"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2">Contrasena</label>
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="********"
                    className="text-lg py-6"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full text-xl py-6 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-lg font-medium mb-2">Nombre Completo</label>
                  <Input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Juan Perez"
                    className="text-lg py-6"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2">Correo Electronico</label>
                  <Input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="text-lg py-6"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2">Contrasena</label>
                  <Input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="********"
                    className="text-lg py-6"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2">Telefono</label>
                  <Input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="300 123 4567"
                    className="text-lg py-6"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2">Direccion</label>
                  <Input
                    type="text"
                    value={registerAddress}
                    onChange={(e) => setRegisterAddress(e.target.value)}
                    placeholder="Calle 123 #45-67"
                    className="text-lg py-6"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full text-xl py-6 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
