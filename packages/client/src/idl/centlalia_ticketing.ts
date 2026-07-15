/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/centlalia_ticketing.json`.
 */
export type CentlaliaTicketing = {
  address: '6KVngKJVYYbqfeXxzXdnaZzmKwo58iin8LmiMyZjgpbu';
  metadata: {
    name: 'centlaliaTicketing';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Centlalia verifiable event ticketing program';
  };
  instructions: [
    {
      name: 'addTier';
      discriminator: [92, 225, 133, 110, 149, 39, 185, 4];
      accounts: [
        {
          name: 'organizer';
          writable: true;
          signer: true;
          relations: ['event'];
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
        {
          name: 'tier';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 105, 101, 114];
              },
              {
                kind: 'account';
                path: 'event';
              },
              {
                kind: 'arg';
                path: 'tierId';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'tierId';
          type: 'u16';
        },
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'priceLamports';
          type: 'u64';
        },
        {
          name: 'supply';
          type: 'u32';
        },
      ];
    },
    {
      name: 'authorizeStaff';
      discriminator: [58, 0, 175, 253, 33, 232, 2, 31];
      accounts: [
        {
          name: 'organizer';
          writable: true;
          signer: true;
          relations: ['event'];
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
        },
        {
          name: 'staff';
        },
        {
          name: 'staffAuthorization';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 116, 97, 102, 102];
              },
              {
                kind: 'account';
                path: 'event';
              },
              {
                kind: 'account';
                path: 'staff';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'buyResale';
      discriminator: [71, 230, 159, 123, 90, 231, 111, 104];
      accounts: [
        {
          name: 'buyer';
          writable: true;
          signer: true;
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
        },
        {
          name: 'ticketRecord';
          writable: true;
        },
        {
          name: 'listing';
          writable: true;
        },
        {
          name: 'seller';
          writable: true;
        },
        {
          name: 'organizer';
          writable: true;
          relations: ['event'];
        },
        {
          name: 'treasury';
          writable: true;
        },
        {
          name: 'managedAsset';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 97, 110, 97, 103, 101, 100, 45, 97, 115, 115, 101, 116];
              },
              {
                kind: 'account';
                path: 'ticketRecord';
              },
            ];
          };
        },
        {
          name: 'assetAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 115, 115, 101, 116, 45, 97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
              {
                kind: 'account';
                path: 'platformConfig';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'cancelCheckIn';
      discriminator: [90, 228, 52, 216, 156, 213, 27, 20];
      accounts: [
        {
          name: 'holder';
          signer: true;
        },
        {
          name: 'ticketRecord';
          writable: true;
        },
        {
          name: 'checkInIntent';
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: 'cancelEvent';
      discriminator: [55, 143, 36, 45, 59, 241, 89, 119];
      accounts: [
        {
          name: 'organizer';
          signer: true;
          relations: ['event'];
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: 'cancelListing';
      discriminator: [41, 183, 50, 232, 230, 233, 157, 70];
      accounts: [
        {
          name: 'seller';
          signer: true;
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'ticketRecord';
          writable: true;
        },
        {
          name: 'listing';
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: 'closeEvent';
      discriminator: [117, 114, 193, 54, 49, 25, 75, 194];
      accounts: [
        {
          name: 'organizer';
          signer: true;
          relations: ['event'];
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: 'consumeCheckIn';
      discriminator: [86, 147, 234, 154, 215, 142, 88, 186];
      accounts: [
        {
          name: 'staff';
          signer: true;
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
        },
        {
          name: 'ticketRecord';
          writable: true;
        },
        {
          name: 'managedAsset';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 97, 110, 97, 103, 101, 100, 45, 97, 115, 115, 101, 116];
              },
              {
                kind: 'account';
                path: 'ticketRecord';
              },
            ];
          };
        },
        {
          name: 'assetAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 115, 115, 101, 116, 45, 97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
              {
                kind: 'account';
                path: 'platformConfig';
              },
            ];
          };
        },
        {
          name: 'staffAuthorization';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 116, 97, 102, 102];
              },
              {
                kind: 'account';
                path: 'event';
              },
              {
                kind: 'account';
                path: 'staff';
              },
            ];
          };
        },
        {
          name: 'checkInIntent';
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: 'createEvent';
      discriminator: [49, 219, 29, 203, 22, 98, 100, 87];
      accounts: [
        {
          name: 'organizer';
          writable: true;
          signer: true;
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 118, 101, 110, 116];
              },
              {
                kind: 'account';
                path: 'organizer';
              },
              {
                kind: 'arg';
                path: 'eventId';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'eventId';
          type: 'u64';
        },
        {
          name: 'details';
          type: {
            defined: {
              name: 'eventDetails';
            };
          };
        },
      ];
    },
    {
      name: 'expireCheckIn';
      discriminator: [65, 135, 242, 109, 30, 73, 85, 6];
      accounts: [
        {
          name: 'keeper';
          signer: true;
        },
        {
          name: 'ticketRecord';
          writable: true;
        },
        {
          name: 'checkInIntent';
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: 'giftTicket';
      discriminator: [150, 80, 29, 171, 14, 135, 247, 129];
      accounts: [
        {
          name: 'currentOwner';
          signer: true;
        },
        {
          name: 'recipient';
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
        },
        {
          name: 'ticketRecord';
          writable: true;
        },
        {
          name: 'managedAsset';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 97, 110, 97, 103, 101, 100, 45, 97, 115, 115, 101, 116];
              },
              {
                kind: 'account';
                path: 'ticketRecord';
              },
            ];
          };
        },
        {
          name: 'assetAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 115, 115, 101, 116, 45, 97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
              {
                kind: 'account';
                path: 'platformConfig';
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: 'initializePlatform';
      discriminator: [119, 201, 101, 45, 75, 122, 89, 3];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'platformConfig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'assetAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 115, 115, 101, 116, 45, 97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
              {
                kind: 'account';
                path: 'platformConfig';
              },
            ];
          };
        },
        {
          name: 'treasury';
        },
        {
          name: 'program';
          address: '6KVngKJVYYbqfeXxzXdnaZzmKwo58iin8LmiMyZjgpbu';
        },
        {
          name: 'programData';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'platformFeeBps';
          type: 'u16';
        },
        {
          name: 'assetStandard';
          type: {
            defined: {
              name: 'assetStandard';
            };
          };
        },
      ];
    },
    {
      name: 'listTicket';
      discriminator: [11, 213, 240, 45, 246, 35, 44, 162];
      accounts: [
        {
          name: 'seller';
          writable: true;
          signer: true;
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
        },
        {
          name: 'ticketRecord';
          writable: true;
        },
        {
          name: 'managedAsset';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 97, 110, 97, 103, 101, 100, 45, 97, 115, 115, 101, 116];
              },
              {
                kind: 'account';
                path: 'ticketRecord';
              },
            ];
          };
        },
        {
          name: 'assetAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 115, 115, 101, 116, 45, 97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
              {
                kind: 'account';
                path: 'platformConfig';
              },
            ];
          };
        },
        {
          name: 'listing';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [108, 105, 115, 116, 105, 110, 103];
              },
              {
                kind: 'account';
                path: 'ticketRecord';
              },
              {
                kind: 'arg';
                path: 'listingId';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'listingId';
          type: 'u32';
        },
        {
          name: 'priceLamports';
          type: 'u64';
        },
        {
          name: 'expiresAt';
          type: 'i64';
        },
      ];
    },
    {
      name: 'presentCheckIn';
      discriminator: [26, 31, 84, 165, 124, 127, 126, 218];
      accounts: [
        {
          name: 'holder';
          writable: true;
          signer: true;
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
        },
        {
          name: 'ticketRecord';
          writable: true;
        },
        {
          name: 'managedAsset';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 97, 110, 97, 103, 101, 100, 45, 97, 115, 115, 101, 116];
              },
              {
                kind: 'account';
                path: 'ticketRecord';
              },
            ];
          };
        },
        {
          name: 'assetAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 115, 115, 101, 116, 45, 97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
              {
                kind: 'account';
                path: 'platformConfig';
              },
            ];
          };
        },
        {
          name: 'checkInIntent';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 104, 101, 99, 107, 45, 105, 110, 45, 105, 110, 116, 101, 110, 116];
              },
              {
                kind: 'account';
                path: 'ticketRecord';
              },
              {
                kind: 'arg';
                path: 'intentNonce';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'intentNonce';
          type: 'u64';
        },
        {
          name: 'expiresAt';
          type: 'i64';
        },
      ];
    },
    {
      name: 'primaryPurchase';
      discriminator: [81, 231, 187, 235, 87, 209, 43, 86];
      accounts: [
        {
          name: 'buyer';
          writable: true;
          signer: true;
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
        {
          name: 'tier';
          writable: true;
        },
        {
          name: 'organizer';
          writable: true;
          relations: ['event'];
        },
        {
          name: 'treasury';
          writable: true;
        },
        {
          name: 'ticketRecord';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 105, 99, 107, 101, 116];
              },
              {
                kind: 'account';
                path: 'event';
              },
              {
                kind: 'arg';
                path: 'ticketId';
              },
            ];
          };
        },
        {
          name: 'managedAsset';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 97, 110, 97, 103, 101, 100, 45, 97, 115, 115, 101, 116];
              },
              {
                kind: 'account';
                path: 'ticketRecord';
              },
            ];
          };
        },
        {
          name: 'assetAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 115, 115, 101, 116, 45, 97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
              {
                kind: 'account';
                path: 'platformConfig';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'ticketId';
          type: 'u64';
        },
      ];
    },
    {
      name: 'publishEvent';
      discriminator: [66, 121, 175, 133, 20, 2, 221, 42];
      accounts: [
        {
          name: 'organizer';
          signer: true;
          relations: ['event'];
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: 'revokeStaff';
      discriminator: [45, 222, 187, 197, 113, 90, 15, 171];
      accounts: [
        {
          name: 'organizer';
          signer: true;
          relations: ['event'];
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
        },
        {
          name: 'staff';
        },
        {
          name: 'staffAuthorization';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 116, 97, 102, 102];
              },
              {
                kind: 'account';
                path: 'event';
              },
              {
                kind: 'account';
                path: 'staff';
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: 'updateEvent';
      discriminator: [70, 108, 211, 125, 171, 176, 25, 217];
      accounts: [
        {
          name: 'organizer';
          signer: true;
          relations: ['event'];
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
      ];
      args: [
        {
          name: 'details';
          type: {
            defined: {
              name: 'eventDetails';
            };
          };
        },
      ];
    },
    {
      name: 'updatePlatform';
      discriminator: [46, 78, 138, 189, 47, 163, 120, 85];
      accounts: [
        {
          name: 'admin';
          signer: true;
          relations: ['platformConfig'];
        },
        {
          name: 'platformConfig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'treasury';
        },
      ];
      args: [
        {
          name: 'platformFeeBps';
          type: 'u16';
        },
        {
          name: 'paused';
          type: 'bool';
        },
      ];
    },
    {
      name: 'updateTier';
      discriminator: [22, 250, 234, 251, 201, 246, 98, 116];
      accounts: [
        {
          name: 'organizer';
          signer: true;
          relations: ['event'];
        },
        {
          name: 'platformConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109];
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
        {
          name: 'tier';
          writable: true;
        },
      ];
      args: [
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'priceLamports';
          type: 'u64';
        },
        {
          name: 'supply';
          type: 'u32';
        },
        {
          name: 'active';
          type: 'bool';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'checkInIntent';
      discriminator: [214, 175, 74, 108, 147, 62, 201, 63];
    },
    {
      name: 'event';
      discriminator: [125, 192, 125, 158, 9, 115, 152, 233];
    },
    {
      name: 'listing';
      discriminator: [218, 32, 50, 73, 43, 134, 26, 58];
    },
    {
      name: 'managedAsset';
      discriminator: [189, 252, 111, 59, 93, 126, 178, 39];
    },
    {
      name: 'platformConfig';
      discriminator: [160, 78, 128, 0, 248, 83, 230, 160];
    },
    {
      name: 'staffAuthorization';
      discriminator: [72, 133, 175, 176, 215, 153, 218, 236];
    },
    {
      name: 'ticketRecord';
      discriminator: [37, 215, 102, 48, 114, 66, 21, 87];
    },
    {
      name: 'tier';
      discriminator: [18, 149, 18, 34, 50, 201, 207, 55];
    },
  ];
  events: [
    {
      name: 'checkInConsumed';
      discriminator: [11, 132, 125, 75, 33, 243, 1, 68];
    },
    {
      name: 'primaryPurchaseRecorded';
      discriminator: [67, 49, 19, 1, 247, 9, 209, 145];
    },
    {
      name: 'ticketOwnershipTransferred';
      discriminator: [79, 142, 240, 106, 86, 159, 155, 130];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'platformPaused';
      msg: 'The platform is paused';
    },
    {
      code: 6001;
      name: 'unsupportedAssetStandard';
      msg: 'The requested asset standard does not yet have a verified CPI adapter';
    },
    {
      code: 6002;
      name: 'invalidAsset';
      msg: 'The supplied account is not the canonical asset for this ticket';
    },
    {
      code: 6003;
      name: 'assetOwnerMismatch';
      msg: 'The canonical asset owner and ticket owner differ';
    },
    {
      code: 6004;
      name: 'invalidAssetAuthority';
      msg: 'The canonical asset authority is invalid';
    },
    {
      code: 6005;
      name: 'invalidBasisPoints';
      msg: 'Basis points must be at most 10,000';
    },
    {
      code: 6006;
      name: 'invalidFeeConfiguration';
      msg: 'Platform fee and organizer royalty exceed 100%';
    },
    {
      code: 6007;
      name: 'invalidEventTitle';
      msg: 'Event title is empty or too long';
    },
    {
      code: 6008;
      name: 'invalidMetadataUri';
      msg: 'Event metadata URI is too long';
    },
    {
      code: 6009;
      name: 'invalidEventWindows';
      msg: 'Event time windows are invalid';
    },
    {
      code: 6010;
      name: 'invalidEventState';
      msg: 'The event is not in the required state';
    },
    {
      code: 6011;
      name: 'eventHasNoTiers';
      msg: 'The event must contain at least one tier before publication';
    },
    {
      code: 6012;
      name: 'salesClosed';
      msg: 'The event sales window is closed';
    },
    {
      code: 6013;
      name: 'checkInClosed';
      msg: 'The event check-in window is closed';
    },
    {
      code: 6014;
      name: 'transferClosed';
      msg: 'The event transfer window is closed';
    },
    {
      code: 6015;
      name: 'eventNotEnded';
      msg: 'The event has not ended';
    },
    {
      code: 6016;
      name: 'invalidTierName';
      msg: 'Tier name is empty or too long';
    },
    {
      code: 6017;
      name: 'invalidTierSupply';
      msg: 'Tier supply must be greater than zero';
    },
    {
      code: 6018;
      name: 'supplyBelowSales';
      msg: 'Tier supply cannot be reduced below sold inventory';
    },
    {
      code: 6019;
      name: 'tierInactive';
      msg: 'The tier is inactive';
    },
    {
      code: 6020;
      name: 'tierSoldOut';
      msg: 'The tier is sold out';
    },
    {
      code: 6021;
      name: 'invalidRelationship';
      msg: 'The event, tier, ticket, listing, or intent relationship is invalid';
    },
    {
      code: 6022;
      name: 'invalidSequence';
      msg: 'The supplied sequence number is not the next expected value';
    },
    {
      code: 6023;
      name: 'ticketNotActive';
      msg: 'The ticket is not active';
    },
    {
      code: 6024;
      name: 'ticketAlreadyUsed';
      msg: 'The ticket has already been used';
    },
    {
      code: 6025;
      name: 'notTicketOwner';
      msg: 'The signer does not own the ticket';
    },
    {
      code: 6026;
      name: 'sameOwner';
      msg: 'A ticket cannot be transferred to its current owner';
    },
    {
      code: 6027;
      name: 'freeTicketResale';
      msg: 'Free tickets cannot be listed for paid resale';
    },
    {
      code: 6028;
      name: 'invalidResalePrice';
      msg: 'The resale price is zero or exceeds the event markup limit';
    },
    {
      code: 6029;
      name: 'invalidListingExpiry';
      msg: 'The listing expiry is invalid';
    },
    {
      code: 6030;
      name: 'listingNotActive';
      msg: 'The listing is not active';
    },
    {
      code: 6031;
      name: 'listingExpired';
      msg: 'The listing has expired';
    },
    {
      code: 6032;
      name: 'sellerCannotBuy';
      msg: 'The buyer cannot also be the seller';
    },
    {
      code: 6033;
      name: 'staffAlreadyAuthorized';
      msg: 'The staff authorization is already active';
    },
    {
      code: 6034;
      name: 'staffNotAuthorized';
      msg: 'The staff authorization is not active';
    },
    {
      code: 6035;
      name: 'invalidIntentExpiry';
      msg: 'The check-in intent expiry is outside the allowed range';
    },
    {
      code: 6036;
      name: 'intentNotPending';
      msg: 'The check-in intent is not pending';
    },
    {
      code: 6037;
      name: 'intentExpired';
      msg: 'The check-in intent has expired';
    },
    {
      code: 6038;
      name: 'intentNotExpired';
      msg: 'The check-in intent has not expired';
    },
    {
      code: 6039;
      name: 'arithmeticOverflow';
      msg: 'Arithmetic overflow';
    },
    {
      code: 6040;
      name: 'eventHasTickets';
      msg: 'A published event with issued tickets requires a refund policy before cancellation';
    },
  ];
  types: [
    {
      name: 'assetStandard';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'managed';
          },
          {
            name: 'bubblegumV2';
          },
          {
            name: 'mplCore';
          },
        ];
      };
    },
    {
      name: 'checkInConsumed';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'event';
            type: 'pubkey';
          },
          {
            name: 'ticket';
            type: 'pubkey';
          },
          {
            name: 'holder';
            type: 'pubkey';
          },
          {
            name: 'staff';
            type: 'pubkey';
          },
          {
            name: 'consumedAt';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'checkInIntent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'ticket';
            type: 'pubkey';
          },
          {
            name: 'event';
            type: 'pubkey';
          },
          {
            name: 'holder';
            type: 'pubkey';
          },
          {
            name: 'nonce';
            type: 'u64';
          },
          {
            name: 'expiresAt';
            type: 'i64';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'checkInIntentStatus';
              };
            };
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
          {
            name: 'consumedAt';
            type: {
              option: 'i64';
            };
          },
          {
            name: 'staff';
            type: {
              option: 'pubkey';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'checkInIntentStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'pending';
          },
          {
            name: 'cancelled';
          },
          {
            name: 'expired';
          },
          {
            name: 'consumed';
          },
        ];
      };
    },
    {
      name: 'event';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'organizer';
            type: 'pubkey';
          },
          {
            name: 'platformTreasury';
            type: 'pubkey';
          },
          {
            name: 'eventId';
            type: 'u64';
          },
          {
            name: 'title';
            type: 'string';
          },
          {
            name: 'metadataUri';
            type: 'string';
          },
          {
            name: 'salesStartAt';
            type: 'i64';
          },
          {
            name: 'salesEndAt';
            type: 'i64';
          },
          {
            name: 'startsAt';
            type: 'i64';
          },
          {
            name: 'endsAt';
            type: 'i64';
          },
          {
            name: 'checkInStartAt';
            type: 'i64';
          },
          {
            name: 'checkInEndAt';
            type: 'i64';
          },
          {
            name: 'maxResaleMarkupBps';
            type: 'u16';
          },
          {
            name: 'organizerRoyaltyBps';
            type: 'u16';
          },
          {
            name: 'platformFeeBps';
            type: 'u16';
          },
          {
            name: 'resaleEnabled';
            type: 'bool';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'eventStatus';
              };
            };
          },
          {
            name: 'nextTierId';
            type: 'u16';
          },
          {
            name: 'nextTicketId';
            type: 'u64';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'eventDetails';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'title';
            type: 'string';
          },
          {
            name: 'metadataUri';
            type: 'string';
          },
          {
            name: 'salesStartAt';
            type: 'i64';
          },
          {
            name: 'salesEndAt';
            type: 'i64';
          },
          {
            name: 'startsAt';
            type: 'i64';
          },
          {
            name: 'endsAt';
            type: 'i64';
          },
          {
            name: 'checkInStartAt';
            type: 'i64';
          },
          {
            name: 'checkInEndAt';
            type: 'i64';
          },
          {
            name: 'maxResaleMarkupBps';
            type: 'u16';
          },
          {
            name: 'organizerRoyaltyBps';
            type: 'u16';
          },
          {
            name: 'resaleEnabled';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'eventStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'draft';
          },
          {
            name: 'published';
          },
          {
            name: 'cancelled';
          },
          {
            name: 'closed';
          },
        ];
      };
    },
    {
      name: 'listing';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'ticket';
            type: 'pubkey';
          },
          {
            name: 'event';
            type: 'pubkey';
          },
          {
            name: 'seller';
            type: 'pubkey';
          },
          {
            name: 'listingId';
            type: 'u32';
          },
          {
            name: 'priceLamports';
            type: 'u64';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'listingStatus';
              };
            };
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
          {
            name: 'expiresAt';
            type: {
              option: 'i64';
            };
          },
          {
            name: 'buyer';
            type: {
              option: 'pubkey';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'listingStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'active';
          },
          {
            name: 'cancelled';
          },
          {
            name: 'filled';
          },
        ];
      };
    },
    {
      name: 'managedAsset';
      docs: [
        'Canonical MVP asset ownership record.',
        '',
        'Bubblegum/Core tickets must not use this account: they require a CPI adapter',
        'that proves the external asset transfer before `TicketRecord.owner` changes.',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'pubkey';
          },
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'ticket';
            type: 'pubkey';
          },
          {
            name: 'standard';
            type: {
              defined: {
                name: 'assetStandard';
              };
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'platformConfig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'admin';
            type: 'pubkey';
          },
          {
            name: 'treasury';
            type: 'pubkey';
          },
          {
            name: 'assetStandard';
            type: {
              defined: {
                name: 'assetStandard';
              };
            };
          },
          {
            name: 'platformFeeBps';
            type: 'u16';
          },
          {
            name: 'paused';
            type: 'bool';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'assetAuthorityBump';
            type: 'u8';
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
          {
            name: 'version';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'primaryPurchaseRecorded';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'event';
            type: 'pubkey';
          },
          {
            name: 'ticket';
            type: 'pubkey';
          },
          {
            name: 'assetId';
            type: 'pubkey';
          },
          {
            name: 'buyer';
            type: 'pubkey';
          },
          {
            name: 'priceLamports';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'staffAuthorization';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'event';
            type: 'pubkey';
          },
          {
            name: 'staff';
            type: 'pubkey';
          },
          {
            name: 'active';
            type: 'bool';
          },
          {
            name: 'authorizedAt';
            type: 'i64';
          },
          {
            name: 'revokedAt';
            type: {
              option: 'i64';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'ticketOwnershipTransferred';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'ticket';
            type: 'pubkey';
          },
          {
            name: 'assetId';
            type: 'pubkey';
          },
          {
            name: 'previousOwner';
            type: 'pubkey';
          },
          {
            name: 'newOwner';
            type: 'pubkey';
          },
          {
            name: 'viaResale';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'ticketRecord';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'event';
            type: 'pubkey';
          },
          {
            name: 'tier';
            type: 'pubkey';
          },
          {
            name: 'serial';
            type: 'u64';
          },
          {
            name: 'assetId';
            type: 'pubkey';
          },
          {
            name: 'assetStandard';
            type: {
              defined: {
                name: 'assetStandard';
              };
            };
          },
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'originalPriceLamports';
            type: 'u64';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'ticketStatus';
              };
            };
          },
          {
            name: 'transferCount';
            type: 'u32';
          },
          {
            name: 'usedAt';
            type: {
              option: 'i64';
            };
          },
          {
            name: 'usedBy';
            type: {
              option: 'pubkey';
            };
          },
          {
            name: 'nextListingId';
            type: 'u32';
          },
          {
            name: 'nextIntentNonce';
            type: 'u64';
          },
          {
            name: 'activeIntent';
            type: {
              option: 'pubkey';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'ticketStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'active';
          },
          {
            name: 'listed';
          },
          {
            name: 'used';
          },
          {
            name: 'cancelled';
          },
        ];
      };
    },
    {
      name: 'tier';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'event';
            type: 'pubkey';
          },
          {
            name: 'tierId';
            type: 'u16';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'priceLamports';
            type: 'u64';
          },
          {
            name: 'supply';
            type: 'u32';
          },
          {
            name: 'sold';
            type: 'u32';
          },
          {
            name: 'active';
            type: 'bool';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'createdAt';
            type: 'i64';
          },
        ];
      };
    },
  ];
};
