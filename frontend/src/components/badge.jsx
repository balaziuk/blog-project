import { Slot } from "@radix-ui/react-slot";


function Badge({ asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge };
