import Image from "next/image";

// export default function Home() {
//   return <h1 className="text-4xl font-bold text-blue-600">My Store</h1>;
// }

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">My Store</h1>
      <Button>Buy Now</Button>
      <Button>Buy Now</Button>
      <Button>Buy Now</Button>
    </div>
  );
}
