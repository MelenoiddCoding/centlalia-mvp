import { DemoWorkspace } from '@/components/demo-workspace';
import { GatewayProvider } from '@/providers/gateway-provider';

export default function DemoPage() {
  return (
    <GatewayProvider>
      <DemoWorkspace />
    </GatewayProvider>
  );
}
